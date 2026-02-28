import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  getSellerProducts,
  getStoredUserRole,
  saveSellerProducts,
  type SellerProduct,
  type UserRole,
} from "../../lib/storage";
import { useTheme } from "../../theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [current, setCurrent] = useState<SellerProduct | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("unit");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      async function loadRole() {
        setRole(await getStoredUserRole());
      }

      loadRole();
    }, [])
  );

  useEffect(() => {
    async function loadProduct() {
      const existing = await getSellerProducts();
      const found = existing.find((p) => p.id === id) ?? null;
      setCurrent(found);

      if (found) {
        setName(found.name);
        setPrice(String(found.price));
        setUnit(found.unit);
        setCategory(found.category);
        setStock(String(found.stock));
      }
    }

    loadProduct();
  }, [id]);

  async function saveProduct() {
    if (!current) {
      return;
    }

    if (!name.trim() || !price.trim() || !category.trim() || !stock.trim()) {
      Alert.alert("Missing details", "Please fill all required fields.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock)) {
      Alert.alert("Invalid input", "Price and stock must be numbers.");
      return;
    }

    const existing = await getSellerProducts();
    const next = existing.map((product) =>
      product.id === current.id
        ? {
            ...product,
            name: name.trim(),
            price: numericPrice,
            unit: unit.trim() || "unit",
            category: category.trim(),
            stock: numericStock,
          }
        : product
    );

    await saveSellerProducts(next);
    router.back();
  }

  if (role !== "seller" && role !== "admin") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>Seller access only</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30, paddingTop: insets.top + 20, }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: 12, fontSize: 24, fontWeight: "800", color: colors.text }}>Edit Product</Text>

        <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, color: colors.text }} />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Price</Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, color: colors.text }} />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Unit</Text>
        <TextInput value={unit} onChangeText={setUnit} style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, color: colors.text }} />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Category</Text>
        <TextInput value={category} onChangeText={setCategory} style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, color: colors.text }} />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Stock</Text>
        <TextInput value={stock} onChangeText={setStock} keyboardType="numeric" style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, color: colors.text }} />

        <Pressable onPress={saveProduct} style={{ marginTop: 18, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
