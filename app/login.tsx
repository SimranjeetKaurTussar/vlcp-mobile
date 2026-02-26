import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeProvider";

export default function Login() {
  const [phone, setPhone] = useState("");
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor: colors.background }}>
      <Text style={{ fontSize: 26, fontWeight: "700", color: colors.text }}>Welcome 👋</Text>
      <Text style={{ marginTop: 6, color: colors.mutedText }}>
        Enter your phone number to continue
      </Text>

      <Text style={{ marginTop: 18, fontWeight: "600", color: colors.text }}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 9876543210"
        keyboardType="phone-pad"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 12,
          fontSize: 16,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={{
          marginTop: 14,
          backgroundColor: colors.primary,
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "700", fontSize: 16 }}>
          Continue
        </Text>
      </Pressable>
    </View>
  );
}
