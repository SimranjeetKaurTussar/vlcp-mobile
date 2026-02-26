import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";

export type SellerProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  seller: string;
  category: string;
  stock: number;
  images?: string[];
};

export type OrderStatus = "Placed" | "Confirmed" | "Delivered";

export type LocalOrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
};

export type LocalOrder = {
  id: string;
  createdAt: string;
  items: LocalOrderItem[];
  total: number;
  status: OrderStatus;
};

const THEME_MODE_KEY = "vlcp:themeMode";
const BUSINESS_NAME_KEY = "vlcp:businessName";
const WHATSAPP_NUMBER_KEY = "vlcp:whatsappNumber";
export const SELLER_PRODUCTS_KEY = "seller_products";
export const ORDERS_KEY = "orders_history";

export async function getStoredThemeMode(): Promise<ThemeMode | null> {
  const value = await AsyncStorage.getItem(THEME_MODE_KEY);

  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return null;
}

export async function setStoredThemeMode(mode: ThemeMode) {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

export async function getStoredBusinessName() {
  return (await AsyncStorage.getItem(BUSINESS_NAME_KEY)) ?? "VLCP";
}

export async function setStoredBusinessName(name: string) {
  await AsyncStorage.setItem(BUSINESS_NAME_KEY, name.trim() || "VLCP");
}

export async function getStoredWhatsAppNumber() {
  return (await AsyncStorage.getItem(WHATSAPP_NUMBER_KEY)) ?? "91XXXXXXXXXX";
}

export async function setStoredWhatsAppNumber(number: string) {
  await AsyncStorage.setItem(WHATSAPP_NUMBER_KEY, number);
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  const raw = await AsyncStorage.getItem(SELLER_PRODUCTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SellerProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSellerProducts(products: SellerProduct[]) {
  await AsyncStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(products));
}

export async function getOrders(): Promise<LocalOrder[]> {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveOrder(order: LocalOrder) {
  const existing = await getOrders();
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing]));
}
