import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useCart } from "./lib/cart";
import { products } from "./lib/data";
import { getOrders, getSellerProducts, type LocalOrder } from "./lib/storage";
import { useTheme } from "./theme/ThemeProvider";
import { useT } from "./i18n/useT";

export default function OrdersScreen() {
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t } = useT();
  const { addItem, clearCart } = useCart();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setIsLoading(true);
        const stored = await getOrders();
        const sorted = [...stored].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
        setIsLoading(false);
      }

      load();
    }, [])
  );

  function showToast(message: string) {
    setToast(message);
    toastAnim.setValue(0);

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setToast(""));
    }, 1200);
  }

  function statusLabel(status: LocalOrder["status"]) {
    if (status === "Delivered") {
      return "Delivered";
    }

    if (status === "Accepted") {
      return "Confirmed";
    }

    return "Placed";
  }

  function statusStyle(status: LocalOrder["status"]) {
    if (status === "Delivered") {
      return { backgroundColor: "#2E7D32" };
    }

    if (status === "Accepted") {
      return { backgroundColor: "#1565C0" };
    }

    return { backgroundColor: "#6D4C41" };
  }

  async function reorder(order: LocalOrder, replace: boolean) {
    const sellerProducts = await getSellerProducts();
    const allProducts = [...products, ...sellerProducts];

    if (replace) {
      clearCart();
    }

    const missingItems: string[] = [];

    order.items.forEach((item) => {
      const found = allProducts.find((p) => p.id === item.id);

      if (!found) {
        missingItems.push(item.name);
        return;
      }

      for (let i = 0; i < item.qty; i += 1) {
        addItem(found);
      }
    });

    if (missingItems.length > 0) {
      Alert.alert("Some items no longer available", `${missingItems.join(", ")} were skipped.`);
    }

    showToast("Added to cart ✅");
    router.push("/cart");
  }

  function orderAgain(order: LocalOrder) {
    Alert.alert("Reorder", "Replace current cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Add to existing cart", onPress: () => reorder(order, false) },
      { text: "Replace", onPress: () => reorder(order, true) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: fontSizes.subtitle + 6, fontWeight: "800", color: colors.text }}>
            {t("orders")}
          </Text>

          <View style={{ width: 64 }} />
        </View>

        {!isLoading && orders.length === 0 ? (
          <View style={{ marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, ...shadows.card }}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>{t("no_orders")}</Text>
            <Text style={{ marginTop: 4, color: colors.mutedText }}>Your placed orders will appear here.</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 12, gap: 12 }}>
          {isLoading ? (
            <>
              {[1, 2].map((key) => (
                <View key={`order_skeleton_${key}`} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, backgroundColor: colors.surface }}>
                  <View style={{ height: 14, borderRadius: 8, backgroundColor: colors.background }} />
                  <View style={{ marginTop: 8, height: 12, width: "60%", borderRadius: 8, backgroundColor: colors.background }} />
                  <View style={{ marginTop: 10, height: 36, borderRadius: 10, backgroundColor: colors.background }} />
                </View>
              ))}
            </>
          ) : null}
          {orders.map((order) => (
            <View
              key={order.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.sm,
                backgroundColor: colors.surface,
                ...shadows.card,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>

              <View
                style={{
                  alignSelf: "flex-start",
                  marginTop: 8,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  ...statusStyle(order.status),
                }}
              >
                <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
                  {statusLabel(order.status)}
                </Text>
              </View>

              <Text style={{ marginTop: 10, color: colors.text, fontWeight: "800" }}>
                Total: ₹{order.total}
              </Text>

              <Pressable
                onPress={() => orderAgain(order)}
                style={({ pressed }) => ({
                  marginTop: 10,
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Order Again</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 20,
            opacity: toastAnim,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{toast}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
