import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { setAuthToken } from "./lib/storage";
import { useTheme } from "./theme/ThemeProvider";

type LoginMode = "phone" | "email";

const phoneRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<LoginMode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validPhone = phoneRegex.test(phone.trim());
  const validEmail = emailRegex.test(email.trim().toLowerCase());
  const validPassword = password.trim().length >= 6;

  const canContinue = useMemo(() => {
    if (isSubmitting) {
      return false;
    }

    if (mode === "phone") {
      return validPhone;
    }

    return validEmail && validPassword;
  }, [isSubmitting, mode, validPhone, validEmail, validPassword]);

  async function onContinue() {
    if (!canContinue) {
      Alert.alert(
        "Invalid details",
        mode === "phone"
          ? "Enter a valid 10-digit phone number."
          : "Enter a valid email and password (min 6 chars)."
      );
      return;
    }

    setIsSubmitting(true);

    const identity = mode === "phone" ? phone.trim() : email.trim().toLowerCase();
    const token = `token_${mode}_${identity}_${Date.now()}`;

    await setAuthToken(token);
    setIsSubmitting(false);
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor: colors.background }}>
      <Text style={{ fontSize: 26, fontWeight: "700", color: colors.text }}>Welcome 👋</Text>
      <Text style={{ marginTop: 6, color: colors.mutedText }}>Login with phone OTP or email/password</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        {(["phone", "email"] as const).map((option) => {
          const active = mode === option;
          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={{
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surface,
                borderRadius: 999,
                paddingVertical: 9,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: "700", textTransform: "capitalize" }}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "phone" ? (
        <>
          <Text style={{ marginTop: 18, fontWeight: "600", color: colors.text }}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, "").slice(0, 10))}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: validPhone || phone.length === 0 ? colors.border : "#d32f2f",
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
        </>
      ) : (
        <>
          <Text style={{ marginTop: 18, fontWeight: "600", color: colors.text }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: validEmail || email.length === 0 ? colors.border : "#d32f2f",
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />

          <Text style={{ marginTop: 12, fontWeight: "600", color: colors.text }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: validPassword || password.length === 0 ? colors.border : "#d32f2f",
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
        </>
      )}

      <Pressable
        disabled={!canContinue}
        onPress={onContinue}
        style={{
          marginTop: 14,
          backgroundColor: canContinue ? colors.primary : colors.border,
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          opacity: isSubmitting ? 0.8 : 1,
        }}
      >
        <Text style={{ color: canContinue ? colors.onPrimary : colors.mutedText, fontWeight: "700", fontSize: 16 }}>
          {isSubmitting ? "Please wait..." : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
}
