import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { categories, type AppProduct } from "../lib/data";
import { api } from "../lib/api";
import { useTheme } from "../theme/ThemeProvider";

const categoryMeta: Record<
  string,
  { subtitle: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Vegetables: { subtitle: "Fresh & local", icon: "leaf-outline" },
  Fruits: { subtitle: "Seasonal sweetness", icon: "nutrition-outline" },
  Milk: { subtitle: "Daily dairy", icon: "water-outline" },
  Ghee: { subtitle: "Pure village taste", icon: "flask-outline" },
  Pickles: { subtitle: "Homestyle flavors", icon: "restaurant-outline" },
  Handmade: { subtitle: "Crafted with care", icon: "color-palette-outline" },
};

export default function Categories() {
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const [query, setQuery] = useState("");
  const [backendProducts, setBackendProducts] = useState<AppProduct[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadProducts() {
        try {
          const response = await api.get<{
            items: Array<{
              id: string;
              title: string;
              price: number | string;
              images: unknown;
            }>;
          }>("/products");

          const normalized = response.items.map((item) => ({
            id: item.id,
            name: item.title,
            price: Number(item.price),
            unit: "unit",
            seller: "VLCP Seller",
            category: "Vegetables",
            images: Array.isArray(item.images)
              ? item.images.filter((image): image is string => typeof image === "string")
              : [],
          }));

          const deduped = Array.from(new Map(normalized.map((product) => [product.id, product])).values());
          setBackendProducts(deduped);
        } catch {
          setBackendProducts([]);
        }
      }

      loadProducts();
    }, [])
  );

  const allProducts = useMemo(() => backendProducts, [backendProducts]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSizes.subtitle + 6, fontWeight: "800", color: colors.text }}>
          Categories
        </Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>Browse products by category</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search categories..."
          style={{
            marginTop: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <View style={{ marginTop: spacing.md, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.sm }}>
          {filteredCategories.map((category) => {
            const meta = categoryMeta[category.name] ?? {
              subtitle: "Village essentials",
              icon: "grid-outline" as const,
            };
            const count = allProducts.filter((product) => product.category === category.name).length;

            return (
              <Pressable
                key={category.id}
                onPress={() => router.push(`/category/${encodeURIComponent(category.name)}`)}
                style={({ pressed }) => ({
                  width: "48%",
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  opacity: pressed ? 0.92 : 1,
                  ...shadows.card,
                })}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons name={meta.icon} size={16} color={colors.primary} />
                </View>

                <Text style={{ color: colors.text, fontWeight: "800" }}>{category.name}</Text>
                <Text style={{ marginTop: 2, color: colors.mutedText, fontSize: fontSizes.caption }}>
                  {meta.subtitle}
                </Text>
                <Text style={{ marginTop: 8, color: colors.primary, fontWeight: "700", fontSize: fontSizes.caption }}>
                  {count} products
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredCategories.length === 0 ? (
          <View
            style={{
              marginTop: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              backgroundColor: colors.surface,
              alignItems: "center",
              ...shadows.card,
            }}
          >
            <Ionicons name="search-outline" size={24} color={colors.mutedText} />
            <Text style={{ marginTop: 8, color: colors.text, fontWeight: "700" }}>
              No categories found
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
