import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCart } from "../lib/cart";
import { products } from "../lib/data";
import { useTheme } from "../theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SortOption = "default" | "lowToHigh" | "highToLow";

export default function CategoryProducts() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const categoryName = decodeURIComponent(name ?? "");

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  const { addItem } = useCart();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = product.category === categoryName;
      const matchesSearch =
        q.length === 0 ||
        product.name.toLowerCase().includes(q) ||
        product.seller.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [categoryName, query]);

  const displayedProducts = useMemo(() => {
    const next = [...filteredProducts];

    if (sortBy === "lowToHigh") {
      next.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "highToLow") {
      next.sort((a, b) => b.price - a.price);
    }

    return next;
  }, [filteredProducts, sortBy]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 90,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
            ← Back
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: "800",
            color: colors.text,
          }}
        >
          {categoryName}
        </Text>

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
            color: colors.text,
          }}
        />

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.mutedText, fontWeight: "600" }}>
            Sort
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {[
              { key: "default", label: "Default" },
              { key: "lowToHigh", label: "Price: Low to High" },
              { key: "highToLow", label: "Price: High to Low" },
            ].map((option) => {
              const active = sortBy === option.key;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => setSortBy(option.key as SortOption)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderRadius: 999,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.onPrimary : colors.text,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 12 }}>
          {displayedProducts.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => router.push(`/product/${product.id}`)}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 14,
                backgroundColor: colors.surface,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
              >
                {product.name}
              </Text>

              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                Seller: {product.seller}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  ₹{product.price} / {product.unit}
                </Text>

                <Pressable
                  onPress={() => {
                    addItem(product);
                    showToast("Added ✅");
                  }}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
                    Add
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

          {displayedProducts.length === 0 ? (
            <Text style={{ marginTop: 8, color: colors.mutedText }}>
              No products found
            </Text>
          ) : null}
        </View>
      </ScrollView>

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
            <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
              {toast}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
