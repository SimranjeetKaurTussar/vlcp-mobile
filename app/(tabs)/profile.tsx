import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import {
  businessName,
  loadBusinessConfig,
  updateBusinessName,
  updateUpiId,
  updateWhatsAppNumber,
  upiId,
  whatsappNumber,
} from "../lib/config";
import { getStoredAddress, setStoredAddress, type AppLanguage } from "../lib/storage";
import { useT } from "../i18n/useT";

export default function Profile() {
  const { mode, setMode, colors } = useTheme();
  const { t, language, setLanguage } = useT();
  const [name, setName] = useState(businessName);
  const [number, setNumber] = useState(whatsappNumber);
  const [address, setAddress] = useState("");
  const [upi, setUpi] = useState(upiId);

  useEffect(() => {
    async function hydrateBusinessSettings() {
      await loadBusinessConfig();
      setName(businessName);
      setNumber(whatsappNumber);
      setUpi(upiId);
      setAddress(await getStoredAddress());
    }

    hydrateBusinessSettings();
  }, []);

  async function saveBusinessSettings() {
    const cleanNumber = number.replace(/\D/g, "");

    await updateBusinessName(name);
    await updateWhatsAppNumber(cleanNumber);
    await updateUpiId(upi);
    await setStoredAddress(address);

    setName(name.trim() || "VLCP");
    setNumber(cleanNumber);
    setUpi(upi.trim());
    setAddress(address.trim());
    Alert.alert("Saved", "Profile and business settings updated.");
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{t("profile_title")}</Text>

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
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: colors.surface,
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
          borderRadius: 12,
          padding: 12,
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
          borderRadius: 12,
          padding: 12,
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
          borderRadius: 12,
          padding: 12,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />
      <Text style={{ marginTop: 6, color: colors.mutedText, fontSize: 12 }}>
        Digits only (country code + number), e.g. 919876543210
      </Text>

      <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>UPI ID</Text>
      <TextInput
        value={upi}
        onChangeText={setUpi}
        placeholder="example@upi"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 12,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

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
        style={{
          marginTop: 16,
          backgroundColor: colors.primary,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{t("save_settings")}</Text>
      </Pressable>
    </ScrollView>
  );
}
