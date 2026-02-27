import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getStoredUserRole, type UserRole } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function SellerTab() {
  const { colors, spacing, radius, shadows, fontSizes } = useTheme();
  const [role, setRole] = useState<UserRole>("customer");

  useFocusEffect(
    useCallback(() => {
      async function loadRole() {
        setRole(await getStoredUserRole());
      }

      loadRole();
    }, [])
  );

  const allowed = role === "seller" || role === "admin";

  if (!allowed) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ color: colors.text, fontWeight: "800", fontSize: fontSizes.subtitle }}>Seller area restricted</Text>
        <Text style={{ color: colors.mutedText, marginTop: 8, textAlign: "center" }}>Only seller role can access dashboard.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ color: colors.text, fontWeight: "800", fontSize: fontSizes.subtitle + 4 }}>Seller Dashboard</Text>

      <Pressable
        onPress={() => router.push("/seller")}
        style={{ marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, ...shadows.card }}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>My Products</Text>
        <Text style={{ color: colors.mutedText, marginTop: 4 }}>List, add and edit seller products.</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/seller/orders")}
        style={{ marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, ...shadows.card }}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>Orders</Text>
        <Text style={{ color: colors.mutedText, marginTop: 4 }}>Assigned seller orders with status updates.</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/seller/settings")}
        style={{ marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, ...shadows.card }}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>Payout / UPI Settings</Text>
        <Text style={{ color: colors.mutedText, marginTop: 4 }}>Set sellerUpiId for payouts.</Text>
      </Pressable>
    </View>
  );
}
