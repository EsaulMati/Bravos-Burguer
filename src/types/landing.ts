export interface ProductItem {
  id: string;
  name: string;
  category: "burgers" | "sides" | "drinks";
  price: number | null;
  description: string;
  image: string;
  cutoutImage?: string; // Ruta a imagen PNG/WebP transparente (pendiente de proporcionar)
  /** Foto de la burger con sus papas, para el menú. */
  menuImage?: string;
  /** Frase que acompaña a la burger en el menú y en la portada. */
  tagline?: string;
  badge?: string;
  featured?: boolean;
  highlightIngredients?: string[];
}

export interface ComboAddon {
  id: "fries" | "drink";
  name: string;
  description: string;
  price: number | null;
  cutoutImage?: string;
  badge?: string;
}

export interface OrderDraft {
  burgerId: string;
  burgerQuantity: number;
  friesEnabled: boolean;
  friesQuantity: number;
  drinkEnabled: boolean;
  drinkQuantity: number;
  sauce: SauceSelection;
  drink: DrinkSelection;
  notes: string;
}

export type SauceName = "Ranchera" | "Tártara" | "Mayo Golf";
export type SauceSelection = SauceName[] | "Ninguna" | null;
export type DrinkName = "Coca-Cola" | "Inca Kola";
export type DrinkSelection = DrinkName | null;
/** Reparto de gaseosas de un combo, por ejemplo { "Coca-Cola": 1, "Inca Kola": 1 }. */
export type DrinkCounts = Partial<Record<DrinkName, number>>;

export interface BuilderCartItem extends OrderDraft {
  id: string;
  /** Precios del catálogo; se recalculan cada vez que se lee el carrito. */
  unitPrice: number;
  friesUnitPrice: number;
  drinkUnitPrice: number;
}

export interface CatalogCartItem {
  id: string;
  kind: "catalog";
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  sauce: SauceSelection;
  drink: DrinkSelection;
  /** Solo en combos: indicaciones que el cliente escribió en el panel. */
  notes?: string;
  /** Solo en combos con gaseosas: cuántas de cada una lleva cada combo. */
  drinkCounts?: DrinkCounts;
}

export type CartItem = BuilderCartItem | CatalogCartItem;

export interface Cart {
  items: CartItem[];
}

export type PaymentMethod = "yape" | "plin";

export interface CheckoutDraft {
  customerName: string;
  phone: string;
  /** Dirección de entrega tal como la escribe el cliente. */
  address: string;
  /** Referencia opcional: "frente al parque, puerta negra". */
  reference: string;
  /** Enlace de Google Maps con la ubicación del teléfono, si el cliente la compartió. */
  mapsUrl: string;
  paymentMethod: PaymentMethod | "";
}

export type CheckoutErrors = Partial<Record<keyof CheckoutDraft, string>>;
