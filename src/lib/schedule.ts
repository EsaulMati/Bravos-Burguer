/**
 * Horario de atención de Bravos, siempre en hora de Lima (sin importar la zona del teléfono del cliente).
 * Lunes cerrado. Martes y miércoles de 4:30 p. m. a 11:30 p. m. De jueves a domingo de 4:30 p. m. a 1:00 a. m. del día siguiente.
 */

const OPEN_AT = 16 * 60 + 30;

/** Por día (0 = domingo): minuto de cierre contado desde la medianoche del día que abre (25 * 60 = 1:00 a. m. del día siguiente). */
const CLOSE_AT: Record<number, number | null> = {
  0: 25 * 60,
  1: null,
  2: 23 * 60 + 30,
  3: 23 * 60 + 30,
  4: 25 * 60,
  5: 25 * 60,
  6: 25 * 60,
};

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const SCHEDULE_SUMMARY = [
  { days: "Martes y miércoles", hours: "4:30 p. m. – 11:30 p. m." },
  { days: "Jueves a domingo", hours: "4:30 p. m. – 1:00 a. m." },
  { days: "Lunes", hours: "Cerrado" },
];

interface LimaTime { day: number; minutes: number; date: string }

/** Día de la semana, minutos desde medianoche y fecha corta (14/11) en hora de Lima. */
export function limaTime(now: Date): LimaTime {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), date: `${parts.day}/${parts.month}` };
}

function formatTime(minutes: number): string {
  const total = minutes % (24 * 60);
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const suffix = hour < 12 ? "a. m." : "p. m.";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export interface StoreStatus {
  open: boolean;
  /** "Abierto hasta la 1:00 a. m." o "Cerrado · abrimos el jueves a las 4:30 p. m." */
  label: string;
  /** Solo cuando está cerrado: "hoy a las 4:30 p. m.", "mañana a las 4:30 p. m.", "el jueves a las 4:30 p. m." */
  reopens?: string;
}

export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const { day, minutes } = limaTime(now);
  const today = CLOSE_AT[day];
  const yesterday = CLOSE_AT[(day + 6) % 7];

  // Madrugada: el turno de ayer que cierra después de medianoche.
  if (yesterday !== null && yesterday > 24 * 60 && minutes < yesterday - 24 * 60) {
    return { open: true, label: `Abierto hasta la ${formatTime(yesterday)}` };
  }
  if (today !== null && minutes >= OPEN_AT && minutes < today) {
    return { open: true, label: `Abierto hasta ${today > 24 * 60 ? "la" : "las"} ${formatTime(today)}` };
  }

  // Cerrado: busca el próximo día que abre.
  for (let offset = 0; offset < 8; offset += 1) {
    const nextDay = (day + offset) % 7;
    if (CLOSE_AT[nextDay] === null) continue;
    if (offset === 0 && minutes >= OPEN_AT) continue;
    const when = offset === 0 ? "hoy" : offset === 1 ? "mañana" : `el ${DAY_NAMES[nextDay]}`;
    const reopens = `${when} a las ${formatTime(OPEN_AT)}`;
    return { open: false, label: `Cerrado · abrimos ${reopens}`, reopens };
  }
  return { open: false, label: "Cerrado" };
}

/**
 * Código del pedido para que la cocina no los confunda: hora de Lima + dos caracteres al azar (por ejemplo "1932-K7").
 * No es un correlativo del día: para eso haría falta guardar un contador en un servidor.
 */
export function createOrderCode(now: Date = new Date()): { code: string; date: string } {
  const { minutes, date } = limaTime(now);
  const hhmm = `${String(Math.floor(minutes / 60)).padStart(2, "0")}${String(minutes % 60).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = Array.from({ length: 2 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return { code: `${hhmm}-${random}`, date };
}
