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

export default function Home() {
  const { addItem } = useCart();

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
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 90 }}>
        <Text style={{ fontSize: 26, fontWeight: "800" }}>VLCP</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>
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
            borderColor: "#e5e5e5",
            borderRadius: 14,
            padding: 12,
            fontSize: 16,
            backgroundColor: "white",
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
                  borderColor: active ? "black" : "#e5e5e5",
                  backgroundColor: active ? "black" : "white",
                }}
              >
                <Text
                  style={{
                    color: active ? "white" : "black",
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
        <Text style={{ marginTop: 18, fontSize: 18, fontWeight: "800" }}>
          Products
        </Text>

        <View style={{ marginTop: 10, gap: 12 }}>
          {filtered.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/product/${p.id}`)}
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 16,
                padding: 14,
                backgroundColor: "white",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800" }}>{p.name}</Text>
              <Text style={{ marginTop: 4, opacity: 0.7 }}>
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
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  ₹{p.price} / {p.unit}
                </Text>

                <Pressable
                  style={{
                    backgroundColor: "black",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                  }}
                  onPress={() => {
                    addItem(p);
                    showToast("Added to cart ✅");
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>Add</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

          {filtered.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>
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
              backgroundColor: "black",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>{toast}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
