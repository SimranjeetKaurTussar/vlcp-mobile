import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { updateSellerUpiId } from "../lib/config";
import { getStoredSellerUpiId, getStoredUserRole, type UserRole } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function SellerSettings() {
  const { colors, spacing, radius } = useTheme();
  const [role, setRole] = useState<UserRole>("customer");
  const [sellerUpi, setSellerUpi] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [storedRole, storedUpi] = await Promise.all([
          getStoredUserRole(),
          getStoredSellerUpiId(),
        ]);
        setRole(storedRole);
        setSellerUpi(storedUpi);
      }

      load();
    }, [])
  );

  async function save() {
    await updateSellerUpiId(sellerUpi);
    Alert.alert("Saved", "Seller payout UPI updated.");
  }

  if (role !== "seller" && role !== "admin") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontWeight: "800" }}>Seller access only</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: spacing.md, color: colors.text, fontSize: 24, fontWeight: "800" }}>Payout / UPI Settings</Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>Set UPI ID for seller payouts.</Text>

        <Text style={{ marginTop: spacing.md, color: colors.text, fontWeight: "700" }}>Seller UPI ID</Text>
        <TextInput
          value={sellerUpi}
          onChangeText={setSellerUpi}
          placeholder="seller@upi"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, backgroundColor: colors.surface, color: colors.text }}
        />

        <Pressable onPress={save} style={{ marginTop: spacing.md, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.md, alignItems: "center" }}>
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Save Seller UPI</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
