import { View, Text, ScrollView, Pressable, Animated } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { products } from "../lib/data";
import { useCart } from "../lib/cart";
import { useRef, useState } from "react";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, decItem, items } = useCart();

  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

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

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>
          Product not found
        </Text>
      </View>
    );
  }

  // qty in cart
  const cartItem = items.find((i) => i.id === product.id);
  const qty = cartItem?.qty ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 16, fontWeight: "800" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: 14, fontSize: 26, fontWeight: "900" }}>
          {product.name}
        </Text>

        <Text style={{ marginTop: 6, opacity: 0.7 }}>
          Seller: {product.seller} • {product.category}
        </Text>

        <View
          style={{
            marginTop: 18,
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 16,
            padding: 14,
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900" }}>
            ₹{product.price} / {product.unit}
          </Text>
          <Text style={{ marginTop: 10, opacity: 0.75 }}>
            Demo description. Later we add photos, delivery info etc.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "white",
        }}
      >
        {/* Qty Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "900" }}>Quantity</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => qty > 0 && decItem(product.id)}
              style={{
                backgroundColor: "black",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                opacity: qty > 0 ? 1 : 0.4,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>−</Text>
            </Pressable>

            <Text style={{ fontSize: 16, fontWeight: "900" }}>{qty}</Text>

            <Pressable
              onPress={() => {
                addItem(product);
                showToast("Added ✅");
              }}
              style={{
                backgroundColor: "black",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Buttons Row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => {
              if (qty === 0) {
                addItem(product);
                showToast("Added to cart ✅");
              } else {
                router.push("/cart");
              }
            }}
            style={{
              flex: 1,
              backgroundColor: "black",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>
              {qty === 0 ? "Add to Cart" : `Go to Cart (${qty})`}
            </Text>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "900" }}>Buy</Text>
          </Pressable>
        </View>
      </View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 110,
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              backgroundColor: "black",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>
              {toast}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}