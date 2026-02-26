import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { getOrders, type LocalOrder } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { addItem } = useCart();
  const [order, setOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    async function loadOrder() {
      const all = await getOrders();
      setOrder(all.find((o) => o.id === id) ?? null);
    }

    loadOrder();
  }, [id]);

  function handleReorder() {
    if (!order) {
      return;
    }

    order.items.forEach((item) => {
      for (let i = 0; i < item.qty; i += 1) {
        addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
      }
    });

    router.push("/cart");
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
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: 12, fontSize: 22, fontWeight: "800", color: colors.text }}>
          Order Details
        </Text>

        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>

        <Text style={{ marginTop: 6, color: colors.mutedText }}>Status: {order.status}</Text>

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
          <Text style={{ color: colors.text, fontWeight: "800" }}>Total: ₹{order.total}</Text>
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
    </View>
  );
}
