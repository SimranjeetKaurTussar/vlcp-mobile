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
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t } = useT();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [toast, setToast] = useState<string>("");
  const toastAnim = useRef(new Animated.Value(0)).current;
  const cardPressAnim = useRef(new Animated.Value(1)).current;
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);

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



  function onCardPressIn(id: string) {
    setPressedCardId(id);
    Animated.spring(cardPressAnim, { toValue: 0.98, useNativeDriver: true, speed: 25, bounciness: 4 }).start();
  }

  function onCardPressOut() {
    Animated.spring(cardPressAnim, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 4 }).start(() => setPressedCardId(null));
  }

  useFocusEffect(
    useCallback(() => {
      async function loadSellerProducts() {
        setIsLoadingProducts(true);
        const stored = await getSellerProducts();
        setSellerProducts(stored);
        setIsLoadingProducts(false);
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 90 }}>
        <Text style={{ fontSize: fontSizes.title, fontWeight: "800", color: colors.text }}>{t("home_title")}</Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          Organic & handmade products from your village
        </Text>

        {/* Search */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("search_placeholder")}
          style={{
            marginTop: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
            fontSize: 16,
            backgroundColor: colors.surface,
          }}
        />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.md }}
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
        <Text style={{ marginTop: spacing.lg, fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.text }}>
          Products
        </Text>

        <View style={{ marginTop: 10, gap: 12 }}>


          {isLoadingProducts ? (
            <>
              {[1, 2].map((key) => (
                <View
                  key={`skeleton_${key}`}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    padding: 14,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View style={{ height: 140, borderRadius: 12, backgroundColor: colors.background }} />
                  <View style={{ marginTop: 10, height: 14, borderRadius: 8, backgroundColor: colors.background }} />
                  <View style={{ marginTop: 8, height: 12, borderRadius: 8, backgroundColor: colors.background }} />
                </View>
              ))}
            </>
          ) : null}
          {filtered.map((p) => (
            <Animated.View
              key={p.id}
              style={{
                transform: [{ scale: pressedCardId === p.id ? cardPressAnim : 1 }],
              }}
            >
              <Pressable
                onPress={() => router.push(`/product/${p.id}`)}
                onPressIn={() => onCardPressIn(p.id)}
                onPressOut={onCardPressOut}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.95 : 1,
                  ...shadows.card,
                })}
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
                        style={({ pressed }) => ({
                          backgroundColor: colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: radius.md,
                          opacity: pressed ? 0.9 : 1,
                        })}
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
            </Animated.View>
          ))

          {!isLoadingProducts && filtered.length === 0 ? (
            <View
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: 14,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>No results found</Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>Try a different search or category.</Text>
            </View>
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
              borderRadius: radius.md,
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
