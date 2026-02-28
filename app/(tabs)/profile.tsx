import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import {
  businessName,
  loadBusinessConfig,
  updateBusinessName,
  updatePlatformUpiId,
  updateWhatsAppNumber,
  platformUpiId,
  whatsappNumber,
} from "../lib/config";
import {
  getStoredAddress,
  getStoredCustomerRefundUpiId,
  getStoredUserRole,
  setStoredAddress,
  setStoredCustomerRefundUpiId,
  setStoredUserRole,
  clearAuthToken,
  type AppLanguage,
} from "../lib/storage";
import type { UserRole } from "../lib/storage";
import { useT } from "../i18n/useT";

export default function Profile() {
  const { mode, setMode, colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t, language, setLanguage } = useT();
  const [name, setName] = useState(businessName);
  const [number, setNumber] = useState(whatsappNumber);
  const [address, setAddress] = useState("");
  const [platformReceiverUpi, setPlatformReceiverUpi] = useState(platformUpiId);
  const [refundUpi, setRefundUpi] = useState("");
  const [role, setRole] = useState<UserRole>("customer");

  useEffect(() => {
    async function hydrateBusinessSettings() {
      await loadBusinessConfig();
      setName(businessName);
      setNumber(whatsappNumber);
      setPlatformReceiverUpi(platformUpiId);
      setAddress(await getStoredAddress());
      setRefundUpi(await getStoredCustomerRefundUpiId());
      setRole(await getStoredUserRole());
    }

    hydrateBusinessSettings();
  }, []);


  async function logout() {
    await clearAuthToken();
    await setStoredUserRole("customer");
    router.replace("/login");
  }

  async function saveBusinessSettings() {
    const cleanNumber = number.replace(/\D/g, "");

    await updateBusinessName(name);
    await updateWhatsAppNumber(cleanNumber);
    await updatePlatformUpiId(platformReceiverUpi);
    await setStoredAddress(address);
    await setStoredCustomerRefundUpiId(refundUpi);
    await setStoredUserRole(role);

    setName(name.trim() || "VLCP");
    setNumber(cleanNumber);
    setPlatformReceiverUpi(platformReceiverUpi.trim());
    setRefundUpi(refundUpi.trim());
    setAddress(address.trim());
    Alert.alert("Saved", "Profile and business settings updated.");
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
    >
      <Text style={{ fontSize: fontSizes.subtitle + 2, fontWeight: "700", color: colors.text }}>{t("profile_title")}</Text>

      <Text style={{ marginTop: 24, color: colors.mutedText, fontWeight: "600" }}>
        Theme
      </Text>

      <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
        {(["light", "dark", "system"] as const).map((option) => {
          const active = mode === option;

          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text
                style={{
                  color: active ? colors.onPrimary : colors.text,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/orders")}
        style={{
          marginTop: 16,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 12,
          borderRadius: radius.md,
          alignItems: "center",
          backgroundColor: colors.surface,
          ...shadows.card,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "700" }}>{t("view_orders")}</Text>
      </Pressable>

      <Text style={{ marginTop: 28, color: colors.mutedText, fontWeight: "600" }}>
        Delivery Address
      </Text>

      <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>
        Village / Address
      </Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="e.g. Rampur"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

      <Text style={{ marginTop: 28, color: colors.mutedText, fontWeight: "600" }}>
        Business Settings
      </Text>

      <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>
        Business Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="VLCP"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

      <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>
        WhatsApp Number
      </Text>
      <TextInput
        value={number}
        onChangeText={(text) => setNumber(text.replace(/\D/g, ""))}
        placeholder="91XXXXXXXXXX"
        keyboardType="phone-pad"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />
      <Text style={{ marginTop: 6, color: colors.mutedText, fontSize: 12 }}>
        Digits only (country code + number), e.g. 919876543210
      </Text>

      <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>Payment Receiver UPI (Seller/Platform)</Text>
      <TextInput
        value={platformReceiverUpi}
        onChangeText={setPlatformReceiverUpi}
        placeholder="receiver@upi"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />
      <Text style={{ marginTop: 6, color: colors.mutedText, fontSize: 12 }}>Used for collecting checkout payments.</Text>

      <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>Customer Refund UPI (optional)</Text>
      <TextInput
        value={refundUpi}
        onChangeText={setRefundUpi}
        placeholder="refund@upi"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />
      <Text style={{ marginTop: 6, color: colors.mutedText, fontSize: 12 }}>Only for refunds to this customer profile, not payment receiving.</Text>

      <Text style={{ marginTop: 20, color: colors.mutedText, fontWeight: "600" }}>Role</Text>
      <View style={{ flexDirection: "row", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
        {(["customer", "seller", "godown", "delivery", "admin"] as const).map((option) => {
          const active = role === option;

          return (
            <Pressable
              key={option}
              onPress={() => setRole(option)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: "700", textTransform: "capitalize" }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ marginTop: 20, color: colors.mutedText, fontWeight: "600" }}>
        {t("profile_language")}
      </Text>
      <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
        {([
          { code: "pa", label: "Punjabi 🇮🇳" },
          { code: "en", label: "English 🇬🇧" },
        ] as const).map((option) => {
          const active = language === option.code;

          return (
            <Pressable
              key={option.code}
              onPress={() => setLanguage(option.code as AppLanguage)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: "700" }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={saveBusinessSettings}
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: colors.primary,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{t("save_settings")}</Text>
      </Pressable>

      <Pressable
        onPress={logout}
        style={({ pressed }) => ({
          marginTop: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>Logout</Text>
      </Pressable>

    </ScrollView>
  );
}
