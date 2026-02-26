import {
  getStoredBusinessName,
  getStoredWhatsAppNumber,
  getStoredUpiId,
  setStoredBusinessName,
  setStoredUpiId,
  setStoredWhatsAppNumber,
} from "./storage";

export let whatsappNumber = "91XXXXXXXXXX";
export let businessName = "VLCP";
export let upiId = "";

export async function loadBusinessConfig() {
  businessName = await getStoredBusinessName();
  whatsappNumber = await getStoredWhatsAppNumber();
  upiId = await getStoredUpiId();
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


export async function updateUpiId(nextUpiId: string) {
  upiId = nextUpiId.trim();
  await setStoredUpiId(upiId);
}
