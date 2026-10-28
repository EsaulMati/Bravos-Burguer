const FEMININE_PRODUCT_NAMES = new Set([
  "La Gordita",
  "La Gordita con Papas",
  "La Gordita con Gaseosa",
  "La Gordita Full",
  "Porción de Papas",
  "Salsa Ranchera",
  "Salsa Tártara",
  "Salsa Mayo Golf",
  "Coca-Cola",
  "Inca Kola",
]);

export function addedToCartMessage(name: string): string {
  return `${name} ${FEMININE_PRODUCT_NAMES.has(name) ? "añadida" : "añadido"} al carrito`;
}

export function removedFromCartMessage(name: string): string {
  return `${name} ${FEMININE_PRODUCT_NAMES.has(name) ? "eliminada" : "eliminado"} del carrito`;
}
