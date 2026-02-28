import { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { categories, productImagePlaceholder, setProducts, type AppProduct } from "../lib/data";
import { useCart } from "../lib/cart";
import { router } from "expo-router";
import { useTheme } from "../theme/ThemeProvider";
import { api } from "../lib/api";
import { useT } from "../i18n/useT";

export default function Home() {
  const { items, addItem, decItem } = useCart();
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t } = useT();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [backendProducts, setBackendProducts] = useState<AppProduct[]>([]);
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
    Animated.spring(cardPressAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  }

  function onCardPressOut() {
    Animated.spring(cardPressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start(() => setPressedCardId(null));
  }

  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const response = await api.get<{
          items: Array<{
            id: string;
            title: string;
            price: number | string;
            images: unknown;
          }>;
        }>("/products");

        const normalized = response.items.map((item) => {
          const images = Array.isArray(item.images)
            ? item.images.filter((image): image is string => typeof image === "string")
            : [];

          return {
            id: item.id,
            name: item.title,
            price: Number(item.price),
            unit: "unit",
            seller: "VLCP Seller",
            category: "Vegetables",
            images,
          };
        });

        setProducts(normalized);
        setBackendProducts(normalized);
      } catch {
        setProducts([]);
        setBackendProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const allProducts = useMemo(() => backendProducts, [backendProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q);

      const matchesCat = activeCat === "All" || p.category === activeCat;
      return matchesQuery && matchesCat;
    });
  }, [query, activeCat, allProducts]);

  const categoryScopedProducts = useMemo(
    () => allProducts.filter((p) => activeCat === "All" || p.category === activeCat),
    [activeCat, allProducts]
  );

  const todaysPick = useMemo(() => categoryScopedProducts.slice(0, 2), [categoryScopedProducts]);
  const newArrivals = useMemo(
    () => [...categoryScopedProducts].slice(-8).reverse(),
    [categoryScopedProducts]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={isLoadingProducts ? [] : filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 90 }}
        renderItem={({ item: p }) => {
          const cartItem = items.find((i) => i.id === p.id);
          const qty = cartItem?.qty ?? 0;

          return (
            <Animated.View
              style={{
                marginBottom: spacing.sm,
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
                  style={{ width: "100%", height: 140, borderRadius: radius.md, backgroundColor: colors.background }}
                  resizeMode="cover"
                />

                <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "800", color: colors.text }}>
                  {p.name}
                </Text>
                <Text style={{ marginTop: 4, color: colors.mutedText }}>
                  Seller: {p.seller} • {p.category}
                </Text>

                <View style={{ marginTop: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                      ₹{p.price} / {p.unit}
                    </Text>
                    {qty > 0 ? (
                      <Text style={{ marginTop: 4, color: colors.mutedText, fontSize: 13 }}>In cart: {qty}</Text>
                    ) : null}
                  </View>

                  {qty === 0 ? (
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
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          decItem(p.id);
                        }}
                        style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm }}
                      >
                        <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>−</Text>
                      </Pressable>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{qty}</Text>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          addItem(p);
                        }}
                        style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm }}
                      >
                        <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>+</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListHeaderComponent={
          <>
            <Text style={{ fontSize: fontSizes.title, fontWeight: "800", color: colors.text }}>
              {t("home_title")}
            </Text>
            <Text style={{ marginTop: 6, color: colors.mutedText }}>Organic & handmade products from your village</Text>

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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
              {["All", ...categories.map((c) => c.name)].map((name) => {
                const active = name === activeCat;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setActiveCat(name)}
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: radius.pill,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.surface,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: "700" }}>{name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable onPress={() => router.push("/(tabs)/categories")} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>View all categories</Text>
            </Pressable>

            {!isLoadingProducts && query.trim().length === 0 ? (
              <>
                <Text style={{ marginTop: spacing.lg, fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.text }}>
                  Today&apos;s Pick
                </Text>
                <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
                  {todaysPick.map((p) => (
                    <Pressable
                      key={`pick_${p.id}`}
                      onPress={() => router.push(`/product/${p.id}`)}
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
                      <Text style={{ color: colors.text, fontWeight: "800" }}>{p.name}</Text>
                      <Text style={{ marginTop: 4, color: colors.mutedText }}>
                        {p.seller} • ₹{p.price}/{p.unit}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ marginTop: spacing.lg, fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.text }}>
                  New Arrivals
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                  {newArrivals.map((p) => (
                    <Pressable
                      key={`new_${p.id}`}
                      onPress={() => router.push(`/product/${p.id}`)}
                      style={({ pressed }) => ({
                        width: 180,
                        marginRight: spacing.sm,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        padding: spacing.sm,
                        backgroundColor: colors.surface,
                        opacity: pressed ? 0.95 : 1,
                        ...shadows.card,
                      })}
                    >
                      <Image
                        source={{ uri: p.images?.[0] ?? productImagePlaceholder }}
                        style={{ width: "100%", height: 90, borderRadius: radius.md, backgroundColor: colors.background }}
                        resizeMode="cover"
                      />
                      <Text numberOfLines={1} style={{ marginTop: 8, fontWeight: "800", color: colors.text }}>
                        {p.name}
                      </Text>
                      <Text style={{ marginTop: 2, color: colors.mutedText, fontSize: 12 }}>₹{p.price}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Text style={{ marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: fontSizes.subtitle, fontWeight: "800", color: colors.text }}>
              Products
            </Text>

            {isLoadingProducts ? <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.primary} /> : null}
          </>
        }
        ListEmptyComponent={
          !isLoadingProducts ? (
            <View
              style={{
                marginTop: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                backgroundColor: colors.surface,
                alignItems: "center",
                ...shadows.card,
              }}
            >
              <Ionicons name="search-outline" size={28} color={colors.mutedText} />
              <Text style={{ marginTop: 10, color: colors.text, fontWeight: "800" }}>No products found</Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>Please check back later.</Text>
            </View>
          ) : null
        }
      />

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
