import {
  getStoredBusinessName,
  getStoredPlatformUpiId,
  getStoredWhatsAppNumber,
  setStoredBusinessName,
  setStoredPlatformUpiId,
  setStoredWhatsAppNumber,
} from "./storage";

export let whatsappNumber = "91XXXXXXXXXX";
export let businessName = "VLCP";
export let platformUpiId = "";

export async function loadBusinessConfig() {
  businessName = await getStoredBusinessName();
  whatsappNumber = await getStoredWhatsAppNumber();
  platformUpiId = await getStoredPlatformUpiId();
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

export async function updatePlatformUpiId(nextUpiId: string) {
  platformUpiId = nextUpiId.trim();
  await setStoredPlatformUpiId(platformUpiId);
}
