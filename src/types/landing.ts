export type ProductCategory = "all" | "burgers" | "empanadas" | "sides" | "drinks";

export interface CategoryOption {
  id: ProductCategory;
  label: string;
  iconName?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: "burgers" | "empanadas" | "sides" | "drinks";
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
  notes: string;
}

export interface BuilderCartItem extends OrderDraft {
  id: string;
}

export interface CatalogCartItem {
  id: string;
  kind: "catalog";
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
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
