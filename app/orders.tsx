import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCart } from "./lib/cart";
import { getOrders, type LocalOrder } from "./lib/storage";
import { useTheme } from "./theme/ThemeProvider";
import { useFocusEffect } from "expo-router";

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const stored = await getOrders();
        const sorted = [...stored].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      }

      load();
    }, [])
  );

  function statusStyle(status: LocalOrder["status"]) {
    if (status === "Delivered") {
      return { backgroundColor: "#2E7D32" };
    }

    if (status === "Accepted") {
      return { backgroundColor: "#1565C0" };
    }

    return { backgroundColor: "#6D4C41" };
  }

  function orderAgain(order: LocalOrder) {
    order.items.forEach((item) => {
      for (let i = 0; i < item.qty; i += 1) {
        addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
      }
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
          Orders
        </Text>

        {orders.length === 0 ? (
          <Text style={{ marginTop: 12, color: colors.mutedText }}>No orders yet.</Text>
        ) : null}

        <View style={{ marginTop: 12, gap: 12 }}>
          {orders.map((order) => (
            <View
              key={order.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: colors.surface,
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
                  {order.status}
                </Text>
              </View>

              <View style={{ marginTop: 10, gap: 6 }}>
                {order.items.map((item) => (
                  <Text key={`${order.id}_${item.id}`} style={{ color: colors.text }}>
                    {item.name} • Qty {item.qty} • ₹{item.qty * item.price}
                  </Text>
                ))}
              </View>

              <Text style={{ marginTop: 10, color: colors.text, fontWeight: "800" }}>
                Total: ₹{order.total}
              </Text>

              <Pressable
                onPress={() => orderAgain(order)}
                style={{
                  marginTop: 10,
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Order Again</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
