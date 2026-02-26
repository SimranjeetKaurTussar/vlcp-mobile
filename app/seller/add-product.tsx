import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { getSellerProducts, saveSellerProducts, type SellerProduct } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function AddProduct() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("unit");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  async function saveProduct() {
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

    const newProduct: SellerProduct = {
      id: `s_${Date.now()}`,
      name: name.trim(),
      price: numericPrice,
      unit: unit.trim() || "unit",
      seller: "My Shop",
      category: category.trim(),
      stock: numericStock,
    };

    const existing = await getSellerProducts();
    await saveSellerProducts([newProduct, ...existing]);
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: 12, fontSize: 24, fontWeight: "800", color: colors.text }}>Add Product</Text>

        <Text style={{ marginTop: 14, color: colors.text, fontWeight: "600" }}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Product name"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="0"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Unit</Text>
        <TextInput
          value={unit}
          onChangeText={setUnit}
          placeholder="kg / bottle / jar"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Category</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Vegetables"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "600" }}>Stock</Text>
        <TextInput
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="0"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <Pressable
          onPress={saveProduct}
          style={{
            marginTop: 18,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Save Product</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
