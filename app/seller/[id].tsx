import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { products, sellerProfiles } from "../lib/data";
import { getSellerProducts, type SellerProduct } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SellerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sellerName = decodeURIComponent(id ?? "");
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);

  useEffect(() => {
    async function load() {
      const stored = await getSellerProducts();
      setSellerProducts(stored);
    }

    load();
  }, []);

  const profile = sellerProfiles[sellerName] ?? {
    village: "Local Village",
    phone: "91XXXXXXXXXX",
  };

  const list = useMemo(() => {
    const local = sellerProducts.filter((p) => p.seller === sellerName);
    return [...products.filter((p) => p.seller === sellerName), ...local];
  }, [sellerName, sellerProducts]);

  async function contactOnWhatsApp() {
    const message = encodeURIComponent(
      `Hi ${sellerName}, I want to know more about your products.`,
    );
    const appUrl = `whatsapp://send?phone=${profile.phone}&text=${message}`;
    const webUrl = `https://wa.me/${profile.phone}?text=${message}`;

    if (await Linking.canOpenURL(appUrl)) {
      await Linking.openURL(appUrl);
      return;
    }

    if (await Linking.canOpenURL(webUrl)) {
      await Linking.openURL(webUrl);
      return;
    }

    Alert.alert("Unable to open WhatsApp", "Please try again later.");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 30,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>← Back</Text>
        </Pressable>

        <Text
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: "800",
            color: colors.text,
          }}
        >
          {sellerName}
        </Text>

        <View
          style={{
            marginTop: 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ color: colors.mutedText }}>Village</Text>
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            {profile.village}
          </Text>

          <Text style={{ marginTop: 8, color: colors.mutedText }}>Phone</Text>
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            {profile.phone}
          </Text>

          <Pressable
            onPress={contactOnWhatsApp}
            style={{
              marginTop: 12,
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
              Contact on WhatsApp
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            marginTop: 18,
            fontSize: 18,
            fontWeight: "800",
            color: colors.text,
          }}
        >
          Products by this seller
        </Text>

        {list.length === 0 ? (
          <Text style={{ marginTop: 10, color: colors.mutedText }}>
            No products found.
          </Text>
        ) : null}

        <View style={{ marginTop: 10, gap: 10 }}>
          {list.map((item) => (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {item.name}
              </Text>
              <Text style={{ marginTop: 4, color: colors.mutedText }}>
                ₹{item.price} / {item.unit}
              </Text>
              <Text style={{ marginTop: 2, color: colors.mutedText }}>
                {item.category}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
