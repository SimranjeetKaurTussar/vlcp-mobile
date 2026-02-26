import {
  getStoredBusinessName,
  getStoredWhatsAppNumber,
  setStoredBusinessName,
  setStoredWhatsAppNumber,
} from "./storage";

export let whatsappNumber = "91XXXXXXXXXX";
export let businessName = "VLCP";

export async function loadBusinessConfig() {
  businessName = await getStoredBusinessName();
  whatsappNumber = await getStoredWhatsAppNumber();
}

export async function updateBusinessName(name: string) {
  const next = name.trim() || "VLCP";
  businessName = next;
  await setStoredBusinessName(next);
}

export async function updateWhatsAppNumber(number: string) {
  whatsappNumber = number;
  await setStoredWhatsAppNumber(number);
}
