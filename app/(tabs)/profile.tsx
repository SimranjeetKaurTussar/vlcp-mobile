import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import {
  businessName,
  loadBusinessConfig,
  updateBusinessName,
  updateWhatsAppNumber,
  whatsappNumber,
} from "../lib/config";

export default function Profile() {
  const { mode, setMode, colors } = useTheme();
  const [name, setName] = useState(businessName);
  const [number, setNumber] = useState(whatsappNumber);

  useEffect(() => {
    async function hydrateBusinessSettings() {
      await loadBusinessConfig();
      setName(businessName);
      setNumber(whatsappNumber);
    }

    hydrateBusinessSettings();
  }, []);

  async function saveBusinessSettings() {
    const cleanNumber = number.replace(/\D/g, "");

    await updateBusinessName(name);
    await updateWhatsAppNumber(cleanNumber);

    setName(name.trim() || "VLCP");
    setNumber(cleanNumber);
    Alert.alert("Saved", "Business settings updated.");
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Profile</Text>

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
        <Text style={{ color: colors.text, fontWeight: "700" }}>View Orders</Text>
      </Pressable>

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
        <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Save Settings</Text>
      </Pressable>
    </ScrollView>
  );
}
