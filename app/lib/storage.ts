import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";

const THEME_MODE_KEY = "vlcp:themeMode";
const BUSINESS_NAME_KEY = "vlcp:businessName";
const WHATSAPP_NUMBER_KEY = "vlcp:whatsappNumber";

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
