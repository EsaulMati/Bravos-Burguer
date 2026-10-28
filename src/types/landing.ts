export type ProductCategory = "all" | "burgers" | "sides" | "drinks";

export interface CategoryOption {
  id: ProductCategory;
  label: string;
  iconName?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: "burgers" | "sides" | "drinks";
  price: number | null;
  description: string;
  image: string;
  cutoutImage?: string; // Ruta a imagen PNG/WebP transparente (pendiente de proporcionar)
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
export type DrinkSelection = "Coca-Cola" | "Inca Kola" | null;

export interface BuilderCartItem extends OrderDraft {
  id: string;
  /** Snapshot de precios vigente cuando se agregó la orden. */
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
}

export type CartItem = BuilderCartItem | CatalogCartItem;

export interface Cart {
  items: CartItem[];
}

export type PaymentMethod = "yape" | "plin";

export interface CheckoutDraft {
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethod | "";
}

export type CheckoutErrors = Partial<Record<keyof CheckoutDraft, string>>;
