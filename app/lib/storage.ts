import AsyncStorage from "@react-native-async-storage/async-storage";

const SecureStore = (() => {
  try {
    return require("expo-secure-store") as {
      getItemAsync: (key: string) => Promise<string | null>;
      setItemAsync: (key: string, value: string) => Promise<void>;
      deleteItemAsync: (key: string) => Promise<void>;
    };
  } catch {
    return null;
  }
})();

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

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "PACKED"
  | "READY_FOR_PICKUP"
  | "DISPATCHED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "Delivered"
  | "DELIVERED";

export type UserRole = "customer" | "seller" | "godown" | "delivery" | "admin";
export type PaymentReceiverType = "platform" | "godown" | "seller";

export type LocalOrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
  seller?: string;
};

export type LocalOrder = {
  id: string;
  createdAt: string;
  items: LocalOrderItem[];
  total: number;
  status: OrderStatus;
  paymentReceiverType: PaymentReceiverType;
  receiverUpiId: string;
};

const THEME_MODE_KEY = "vlcp:themeMode";
const BUSINESS_NAME_KEY = "vlcp:businessName";
const WHATSAPP_NUMBER_KEY = "vlcp:whatsappNumber";
const PLATFORM_UPI_ID_KEY = "vlcp:platformUpiId";
const CUSTOMER_REFUND_UPI_ID_KEY = "vlcp:customerRefundUpiId";
const SELLER_UPI_ID_KEY = "vlcp:sellerUpiId";
const USER_ADDRESS_KEY = "vlcp:userAddress";
const LANGUAGE_KEY = "vlcp:language";
const USER_ROLE_KEY = "vlcp:userRole";
const AUTH_TOKEN_KEY = "vlcp:authToken";
export const SELLER_PRODUCTS_KEY = "seller_products";
export const ORDERS_KEY = "orders_history";


export async function getAuthToken() {
  if (SecureStore) {
    return (await SecureStore.getItemAsync(AUTH_TOKEN_KEY)) ?? "";
  }

  return (await AsyncStorage.getItem(AUTH_TOKEN_KEY)) ?? "";
}

export async function setAuthToken(token: string) {
  if (SecureStore) {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    return;
  }

  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken() {
  if (SecureStore) {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    return;
  }

  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

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

export async function getStoredAddress() {
  return (await AsyncStorage.getItem(USER_ADDRESS_KEY)) ?? "";
}

export async function getStoredPlatformUpiId() {
  return (await AsyncStorage.getItem(PLATFORM_UPI_ID_KEY)) ?? "";
}

export async function setStoredPlatformUpiId(upiId: string) {
  await AsyncStorage.setItem(PLATFORM_UPI_ID_KEY, upiId.trim());
}

export async function getStoredCustomerRefundUpiId() {
  return (await AsyncStorage.getItem(CUSTOMER_REFUND_UPI_ID_KEY)) ?? "";
}

export async function setStoredCustomerRefundUpiId(upiId: string) {
  await AsyncStorage.setItem(CUSTOMER_REFUND_UPI_ID_KEY, upiId.trim());
}


export async function getStoredSellerUpiId() {
  return (await AsyncStorage.getItem(SELLER_UPI_ID_KEY)) ?? "";
}

export async function setStoredSellerUpiId(upiId: string) {
  await AsyncStorage.setItem(SELLER_UPI_ID_KEY, upiId.trim());
}

export async function setStoredAddress(address: string) {
  await AsyncStorage.setItem(USER_ADDRESS_KEY, address.trim());
}

export type AppLanguage = "pa" | "en";

export async function getStoredLanguage(): Promise<AppLanguage> {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (value === "en" || value === "pa") {
    return value;
  }

  return "pa";
}

export async function setStoredLanguage(language: AppLanguage) {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export async function getStoredUserRole(): Promise<UserRole> {
  const value = await AsyncStorage.getItem(USER_ROLE_KEY);

  if (
    value === "customer" ||
    value === "seller" ||
    value === "godown" ||
    value === "delivery" ||
    value === "admin"
  ) {
    return value;
  }

  return "customer";
}

export async function setStoredUserRole(role: UserRole) {
  await AsyncStorage.setItem(USER_ROLE_KEY, role);
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

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const existing = await getOrders();
  const updated = existing.map((order) =>
    order.id === id ? { ...order, status } : order
  );

  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
}
