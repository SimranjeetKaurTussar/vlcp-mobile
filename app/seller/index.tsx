import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { getSellerProducts, saveSellerProducts, type SellerProduct } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";

export default function SellerDashboard() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<SellerProduct[]>([]);

  async function loadProducts() {
    const stored = await getSellerProducts();
    setProducts(stored);
  }

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  function confirmDelete(id: string) {
    Alert.alert("Delete product", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const next = products.filter((p) => p.id !== id);
          await saveSellerProducts(next);
          setProducts(next);
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text style={{ marginTop: 12, fontSize: 24, fontWeight: "800", color: colors.text }}>
          Seller Dashboard
        </Text>

        <Pressable
          onPress={() => router.push("/seller/add-product")}
          style={{
            marginTop: 14,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Add Product</Text>
        </Pressable>

        <Text style={{ marginTop: 22, fontSize: 18, fontWeight: "800", color: colors.text }}>
          My Products
        </Text>

        {products.length === 0 ? (
          <Text style={{ marginTop: 10, color: colors.mutedText }}>
            No seller products yet.
          </Text>
        ) : null}

        <View style={{ marginTop: 10, gap: 12 }}>
          {products.map((product) => (
            <View
              key={product.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>{product.name}</Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                ₹{product.price} / {product.unit}
              </Text>
              <Text style={{ marginTop: 2, color: colors.mutedText }}>
                {product.category} • Stock: {product.stock}
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => router.push(`/seller/edit-product/${product.id}`)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => confirmDelete(product.id)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
