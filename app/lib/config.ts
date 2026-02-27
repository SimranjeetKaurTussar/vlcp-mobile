import {
  getStoredBusinessName,
  getStoredPlatformUpiId,
  getStoredSellerUpiId,
  getStoredWhatsAppNumber,
  setStoredBusinessName,
  setStoredPlatformUpiId,
  setStoredSellerUpiId,
  setStoredWhatsAppNumber,
} from "./storage";

export let whatsappNumber = "91XXXXXXXXXX";
export let businessName = "VLCP";
export let platformUpiId = "";
export let sellerUpiId = "";

export async function loadBusinessConfig() {
  businessName = await getStoredBusinessName();
  whatsappNumber = await getStoredWhatsAppNumber();
  platformUpiId = await getStoredPlatformUpiId();
  sellerUpiId = await getStoredSellerUpiId();
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

export async function updateSellerUpiId(nextUpiId: string) {
  sellerUpiId = nextUpiId.trim();
  await setStoredSellerUpiId(sellerUpiId);
}
