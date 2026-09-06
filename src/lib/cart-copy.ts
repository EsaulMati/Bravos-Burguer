const FEMININE_PRODUCT_NAMES = new Set([
  "La Gordita",
  "La Gordita con Papas",
  "La Gordita con Gaseosa",
  "La Gordita Full",
  "Porción de Papas",
  "Salsa Ranchera",
  "Salsa Tártara",
  "Coca-Cola",
  "Inca Kola",
  "Empanada Argentina",
  "Empanada de Osobuco",
]);

export function addedToCartMessage(name: string): string {
  return `${name} ${FEMININE_PRODUCT_NAMES.has(name) ? "añadida" : "añadido"} al carrito`;
}

export function removedFromCartMessage(name: string): string {
  return `${name} ${FEMININE_PRODUCT_NAMES.has(name) ? "eliminada" : "eliminado"} del carrito`;
}
