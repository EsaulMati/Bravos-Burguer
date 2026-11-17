import type { Metadata } from "next";
import Link from "next/link";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { ClearStoredDataButton } from "@/src/components/legal/ClearStoredDataButton";
import { BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";

export const metadata: Metadata = {
  title: "Privacidad y cookies",
  description: "Qué datos usa Bravos Grill & Smoke para tu pedido, dónde se guardan y cómo borrarlos.",
  alternates: { canonical: "/privacidad" },
};

const UPDATED_AT = "14 de noviembre de 2026";
const whatsapp = `+${BRAVOS_WHATSAPP_NUMBER.slice(0, 2)} ${BRAVOS_WHATSAPP_NUMBER.slice(2, 5)} ${BRAVOS_WHATSAPP_NUMBER.slice(5, 8)} ${BRAVOS_WHATSAPP_NUMBER.slice(8)}`;

/* Política básica, escrita a partir de lo que el sitio hace de verdad: sin cuentas, sin cookies de seguimiento y con el pedido enviado por WhatsApp. */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#16110E]">
      <Navbar />
      <main className="checkout-page flex-1 px-4 pb-20 sm:px-6">
        <article className="legal-text mx-auto max-w-3xl">
          <h1 className="font-brush text-[2.6rem] leading-none text-[#F3E9D6] sm:text-6xl">Privacidad y cookies</h1>
          <p className="mt-3 text-sm text-[#8c8278]">Última actualización: {UPDATED_AT}</p>

          <p className="mt-8">En Bravos Grill &amp; Smoke cuidamos tus datos. Aquí te contamos, en simple, qué datos usamos para tu pedido, dónde quedan y cómo puedes borrarlos. Esta política sigue la Ley N.° 29733, Ley de Protección de Datos Personales del Perú.</p>

          <h2>Quiénes somos</h2>
          <p>Bravos Grill &amp; Smoke, cocina de hamburguesas con delivery en Arequipa, Perú. Para cualquier consulta sobre tus datos, escríbenos por WhatsApp al <a href={`https://wa.me/${BRAVOS_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">{whatsapp}</a>.</p>

          <h2>Qué datos usamos</h2>
          <ul>
            <li>Tu nombre y tu número de celular.</li>
            <li>Tu dirección de entrega y la referencia que escribas.</li>
            <li>Tu ubicación, solo si tocas &quot;Compartir mi ubicación&quot;. Se convierte en un enlace de Google Maps para el repartidor.</li>
            <li>Lo que pides y el método de pago que eliges (Yape o Plin). No pedimos ni guardamos datos de tarjetas ni de cuentas bancarias.</li>
          </ul>

          <h2>Para qué los usamos</h2>
          <p>Solo para preparar tu pedido, coordinar el pago y el delivery, y comunicarnos contigo sobre ese pedido. No vendemos ni alquilamos tus datos, y no los usamos para publicidad.</p>

          <h2>Dónde quedan tus datos</h2>
          <ul>
            <li><strong>En tu propio dispositivo.</strong> Para que no tengas que escribir todo de nuevo, el sitio guarda tu carrito y tus datos de entrega en el almacenamiento de tu navegador. No se envían a ningún servidor nuestro. El carrito se borra al enviar el pedido o a las 2 horas sin uso.</li>
            <li><strong>En WhatsApp.</strong> Al tocar &quot;Enviar pedido&quot;, se abre WhatsApp con un mensaje ya escrito. Recién cuando tú lo envías, ese mensaje nos llega. WhatsApp es un servicio de Meta y tiene su propia política de privacidad.</li>
            <li><strong>Con el repartidor.</strong> Le pasamos solo lo necesario para entregarte: nombre, celular, dirección, referencia y ubicación.</li>
          </ul>

          <h2>Cookies</h2>
          <p>Este sitio <strong>no usa cookies de publicidad, de analítica ni de seguimiento</strong>. Solo usa el almacenamiento local de tu navegador para lo que te contamos arriba: recordar tu carrito, tus datos de entrega y que ya viste el aviso de privacidad. Nuestro proveedor de alojamiento (Vercel) puede registrar datos técnicos de la conexión, como la dirección IP, por seguridad y para que el sitio funcione.</p>

          <h2>Tus derechos</h2>
          <p>Puedes pedirnos en cualquier momento que te digamos qué datos tuyos tenemos, que los corrijamos o que los eliminemos (derechos de acceso, rectificación, cancelación y oposición). Escríbenos por WhatsApp. Si consideras que no atendimos tu pedido, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.</p>

          <h2>Borrar tus datos de este dispositivo</h2>
          <p>Con este botón se borran el carrito y los datos de entrega guardados en este navegador.</p>
          <ClearStoredDataButton />

          <p className="mt-10"><Link href="/menu">Volver al menú</Link></p>
        </article>
      </main>
      <FooterSimple />
    </div>
  );
}
