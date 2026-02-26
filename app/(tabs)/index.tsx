import { useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
  Image,
} from "react-native";
import { categories, productImagePlaceholder, products } from "../lib/data";
import { useCart } from "../lib/cart";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "../theme/ThemeProvider";
import { getSellerProducts, type SellerProduct } from "../lib/storage";
import { useT } from "../i18n/useT";

export default function Home() {
  const { items, addItem, decItem } = useCart();
  const { colors } = useTheme();
  const { t } = useT();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);

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


  useFocusEffect(
    useCallback(() => {
      async function loadSellerProducts() {
        const stored = await getSellerProducts();
        setSellerProducts(stored);
      }

      loadSellerProducts();
    }, [])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...products, ...sellerProducts].filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q);

      const matchesCat = activeCat === "All" || p.category === activeCat;
      return matchesQuery && matchesCat;
    });
  }, [query, activeCat, sellerProducts]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 90 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>{t("home_title")}</Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          Organic & handmade products from your village
        </Text>

        {/* Search */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("search_placeholder")}
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

        <Pressable onPress={() => router.push("/(tabs)/categories")} style={{ marginTop: 10 }}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>View all categories</Text>
        </Pressable>

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
              <Image
                source={{ uri: p.images?.[0] ?? productImagePlaceholder }}
                style={{ width: "100%", height: 140, borderRadius: 12, backgroundColor: colors.background }}
                resizeMode="cover"
              />

              <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "800", color: colors.text }}>{p.name}</Text>
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
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                    ₹{p.price} / {p.unit}
                  </Text>
                  {(() => {
                    const cartItem = items.find((i) => i.id === p.id);
                    const qty = cartItem?.qty ?? 0;

                    return qty > 0 ? (
                      <Text style={{ marginTop: 4, color: colors.mutedText, fontSize: 13 }}>
                        In cart: {qty}
                      </Text>
                    ) : null;
                  })()}
                </View>

                {(() => {
                  const cartItem = items.find((i) => i.id === p.id);
                  const qty = cartItem?.qty ?? 0;

                  if (qty === 0) {
                    return (
                      <Pressable
                        style={{
                          backgroundColor: colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 12,
                        }}
                        onPress={(event) => {
                          event.stopPropagation();
                          addItem(p);
                          showToast("Added to cart ✅");
                        }}
                      >
                        <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{t("add_to_cart")}</Text>
                      </Pressable>
                    );
                  }

                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          decItem(p.id);
                        }}
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>−</Text>
                      </Pressable>

                      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                        {qty}
                      </Text>

                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          addItem(p);
                        }}
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>+</Text>
                      </Pressable>
                    </View>
                  );
                })()}
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
