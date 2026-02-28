import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  getOrders,
  getStoredBusinessName,
  getStoredUserRole,
  updateOrderStatus,
  type LocalOrder,
  type UserRole,
} from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sellerFlow = ["Accepted", "PACKED", "READY_FOR_PICKUP"] as const;

export default function SellerOrders() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<UserRole>("customer");
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [storedRole, all, sellerName] = await Promise.all([
          getStoredUserRole(),
          getOrders(),
          getStoredBusinessName(),
        ]);

        setRole(storedRole);

        const allowed = storedRole === "seller" || storedRole === "admin";
        if (!allowed) {
          setOrders([]);
          return;
        }

        if (storedRole === "admin") {
          setOrders(all);
          return;
        }

        const mine = all.filter((order) =>
          order.items.some((item) => item.seller === sellerName),
        );
        setOrders(mine);
      }

      load();
    }, []),
  );

  async function updateStatus(
    orderId: string,
    status: (typeof sellerFlow)[number],
  ) {
    await updateOrderStatus(orderId, status);
    const all = await getOrders();
    const sellerName = await getStoredBusinessName();
    setOrders(
      all.filter((order) =>
        order.items.some((item) => item.seller === sellerName),
      ),
    );
    Alert.alert("Updated", `Order moved to ${status}`);
  }

  if (role !== "seller" && role !== "admin") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "800" }}>
          Seller access only
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: 40,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text
          style={{
            marginTop: 10,
            color: colors.text,
            fontSize: 24,
            fontWeight: "800",
          }}
        >
          Seller Orders
        </Text>

        {orders.length === 0 ? (
          <Text style={{ marginTop: spacing.md, color: colors.mutedText }}>
            No assigned orders yet.
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {orders.map((order) => (
            <View
              key={order.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.sm,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                Current: {order.status}
              </Text>
              <Text
                style={{ marginTop: 4, color: colors.text, fontWeight: "700" }}
              >
                Total: ₹{order.total}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {sellerFlow.map((status) => (
                  <Pressable
                    key={`${order.id}_${status}`}
                    onPress={() => updateStatus(order.id, status)}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: "700" }}>
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
