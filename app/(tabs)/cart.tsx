import { View, Text, Pressable } from "react-native";
import { useCart } from "../lib/cart";
import { useTheme } from "../theme/ThemeProvider";

export default function Cart() {
  const { items, addItem, decItem, removeItem, total } = useCart();
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 18, color: colors.text }}>Cart is empty 🛒</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
        Your Cart
      </Text>

      {items.map((p) => (
        <View
          key={p.id}
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontWeight: "800", color: colors.text }}>{p.name}</Text>
          <Text style={{ marginTop: 4, color: colors.mutedText }}>
            ₹{p.price} / {p.unit}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <Pressable
              onPress={() => decItem(p.id)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>-</Text>
            </Pressable>

            <Text
              style={{
                marginHorizontal: 12,
                fontSize: 16,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              {p.qty}
            </Text>

            <Pressable
              onPress={() => addItem(p)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>+</Text>
            </Pressable>

            <Pressable
              onPress={() => removeItem(p.id)}
              style={{
                marginLeft: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontWeight: "700", color: colors.text }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View
        style={{
          marginTop: 18,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
          Total: ₹{total}
        </Text>
      </View>
    </View>
  );
}
