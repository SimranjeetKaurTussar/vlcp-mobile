import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { categories, products } from "../lib/data";
import { useCart } from "../lib/cart";
import { router } from "expo-router";
import { useTheme } from "../theme/ThemeProvider";

export default function Home() {
  const { addItem } = useCart();
  const { colors } = useTheme();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  const [toast, setToast] = useState<string>("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q);

      const matchesCat = activeCat === "All" || p.category === activeCat;
      return matchesQuery && matchesCat;
    });
  }, [query, activeCat]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 90 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>VLCP</Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          Organic & handmade products from your village
        </Text>

        {/* Search */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products or sellers..."
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 12,
            fontSize: 16,
            backgroundColor: colors.surface,
          }}
        />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
        >
          {["All", ...categories.map((c) => c.name)].map((name) => {
            const active = name === activeCat;
            return (
              <Pressable
                key={name}
                onPress={() => setActiveCat(name)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.onPrimary : colors.text,
                    fontWeight: "700",
                  }}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Products */}
        <Text style={{ marginTop: 18, fontSize: 18, fontWeight: "800", color: colors.text }}>
          Products
        </Text>

        <View style={{ marginTop: 10, gap: 12 }}>
          {filtered.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/product/${p.id}`)}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 14,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{p.name}</Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                Seller: {p.seller} • {p.category}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  ₹{p.price} / {p.unit}
                </Text>

                <Pressable
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                  }}
                  onPress={() => {
                    addItem(p);
                    showToast("Added to cart ✅");
                  }}
                >
                  <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Add</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

          {filtered.length === 0 ? (
            <Text style={{ marginTop: 10, color: colors.mutedText }}>
              No products found.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* ✅ Toast overlay OUTSIDE ScrollView */}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 25,
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
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
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
