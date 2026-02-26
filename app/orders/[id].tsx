import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useCart } from "../lib/cart";
import { products } from "../lib/data";
import { getOrders, getSellerProducts, type LocalOrder, type OrderStatus, updateOrderStatus } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { addItem, clearCart } = useCart();
  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      async function loadOrder() {
        const all = await getOrders();
        setOrder(all.find((o) => o.id === id) ?? null);
      }

      loadOrder();
    }, [id])
  );

  function statusLabel(status: OrderStatus) {
    if (status === "Delivered") {
      return "Delivered";
    }

    if (status === "Accepted") {
      return "Confirmed";
    }

    return "Placed";
  }

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

  async function changeStatus(status: OrderStatus) {
    if (!order) {
      return;
    }

    await updateOrderStatus(order.id, status);

    const all = await getOrders();
    const next = all.find((o) => o.id === order.id) ?? null;
    setOrder(next);

    const permissions = await Notifications.requestPermissionsAsync();
    if (permissions.status === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "VLCP",
          body: `Order status updated: ${statusLabel(status)}`,
        },
        trigger: null,
      });
    }
  }

  async function reorder(replace: boolean) {
    if (!order) {
      return;
    }

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

  function handleReorder() {
    Alert.alert("Reorder", "Replace current cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Add to existing cart", onPress: () => reorder(false) },
      { text: "Replace", onPress: () => reorder(true) },
    ]);
  }

  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Order Details</Text>

          <View style={{ width: 64 }} />
        </View>

        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>

        <Text style={{ marginTop: 6, color: colors.mutedText }}>Status: {statusLabel(order.status)}</Text>

        <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
          {(["Pending", "Accepted", "Delivered"] as const).map((status) => {
            const active = order.status === status;

            return (
              <Pressable
                key={statusLabel(status)}
                onPress={() => changeStatus(status)}
                style={{
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: "700" }}>
                  {statusLabel(status)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          {order.items.map((item) => (
            <View
              key={`${order.id}_${item.id}`}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                {item.qty} x ₹{item.price} / {item.unit}
              </Text>
              <Text style={{ marginTop: 4, color: colors.text, fontWeight: "700" }}>
                ₹{item.qty * item.price}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>Grand Total: ₹{order.total}</Text>
        </View>

        <Pressable
          onPress={handleReorder}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Reorder</Text>
        </Pressable>
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
