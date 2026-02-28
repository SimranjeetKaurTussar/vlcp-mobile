import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Linking,
  Image,
  Share,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { productImagePlaceholder, products, sellerProfiles } from "../lib/data";
import { useCart } from "../lib/cart";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { businessName, whatsappNumber } from "../lib/config";
import { getStoredAddress } from "../lib/storage";
import { useT } from "../i18n/useT";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, decItem, items } = useCart();
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [userVillage, setUserVillage] = useState("");

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

  useEffect(() => {
    async function loadAddress() {
      const address = await getStoredAddress();
      setUserVillage(address);
    }

    loadAddress();
  }, []);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
          Product not found
        </Text>
      </View>
    );
  }

  // qty in cart
  const cartItem = items.find((i) => i.id === product.id);
  const qty = cartItem?.qty ?? 0;

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [productImagePlaceholder];

  const sellerProfile = sellerProfiles[product.seller];
  const sellerPhone = sellerProfile?.phone?.replace(/\D/g, "") ?? "";
  const canDeliver = userVillage
    ? sellerProfile?.deliversTo.some(
        (village) => village.toLowerCase() === userVillage.trim().toLowerCase(),
      )
    : false;

  async function contactSellerOnWhatsApp() {
    if (!product || !sellerPhone) {
      Alert.alert(
        "Seller phone missing",
        "Seller contact is currently unavailable.",
      );
      return;
    }

    const message = encodeURIComponent(
      `Hi ${product.seller}, I'm interested in ${product.name}. Is it available?`,
    );
    const appUrl = `whatsapp://send?phone=${sellerPhone}&text=${message}`;
    const webUrl = `https://wa.me/${sellerPhone}?text=${message}`;

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

  async function callSeller() {
    if (!sellerPhone) {
      return;
    }

    const telUrl = `tel:${sellerPhone}`;
    const canOpen = await Linking.canOpenURL(telUrl);

    if (!canOpen) {
      Alert.alert(
        "Unable to make call",
        "Calling is not supported on this device.",
      );
      return;
    }

    await Linking.openURL(telUrl);
  }

  async function shareProductInfo() {
    if (!product) return;
    const shareText = `Check this on VLCP:
${product.name}
Price: ₹${product.price}/${product.unit}
Seller: ${product.seller}`;
    await Share.share({ message: shareText, title: product.name });
  }

  async function openWhatsAppOrder() {
    const cleanWhatsAppNumber = whatsappNumber.replace(/\D/g, "");

    if (!cleanWhatsAppNumber || cleanWhatsAppNumber.includes("X")) {
      Alert.alert(
        "WhatsApp number missing",
        "Please set a valid WhatsApp number in Profile settings.",
      );
      return;
    }
    if (qty === 0) {
      showToast("Add quantity first");
      return;
    }

    if (!product) return;

    const total = qty * product.price;
    const message = `Hi ${businessName}, I want to order:
Product: ${product.name}
Qty: ${qty}
Price: ₹${product.price}/${product.unit}
Total: ₹${total}`;
    const encoded = encodeURIComponent(message);

    const appUrl = `whatsapp://send?phone=${cleanWhatsAppNumber}&text=${encoded}`;
    const webUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encoded}`;

    const hasWhatsApp = await Linking.canOpenURL(appUrl);

    if (hasWhatsApp) {
      await Linking.openURL(appUrl);
      return;
    }

    const canOpenWeb = await Linking.canOpenURL(webUrl);

    if (canOpenWeb) {
      Alert.alert(
        "WhatsApp not installed",
        "No worries — opening WhatsApp web checkout in your browser.",
      );
      await Linking.openURL(webUrl);
      return;
    }

    Alert.alert(
      "Unable to open WhatsApp",
      "Please install WhatsApp and try again.",
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: 160,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
            ← Back
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 14,
            fontSize: fontSizes.title,
            fontWeight: "900",
            color: colors.text,
          }}
        >
          {product.name}
        </Text>

        <Pressable
          onPress={() =>
            router.push(`/seller/${encodeURIComponent(product.seller)}`)
          }
          style={{ marginTop: 6 }}
        >
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            Seller: {product.seller} • {product.category}
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 6,
            color: canDeliver ? colors.primary : colors.mutedText,
            fontWeight: "700",
          }}
        >
          {userVillage
            ? canDeliver
              ? "Delivery available"
              : "Pickup only"
            : "Add your village in Profile to check delivery"}
        </Text>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 18 }}
        >
          {productImages.map((image, index) => (
            <Image
              key={`${product.id}_${index}`}
              source={{ uri: image }}
              style={{
                width: 300,
                height: 200,
                borderRadius: radius.md,
                marginRight: 10,
                backgroundColor: colors.surface,
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
            ...shadows.card,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
            ₹{product.price} / {product.unit}
          </Text>
          <Text style={{ marginTop: 10, color: colors.mutedText }}>
            Demo description. Later we add photos, delivery info etc.
          </Text>
        </View>

        <View
          style={{
            marginTop: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            backgroundColor: colors.surface,
            ...shadows.card,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>
            Contact Seller
          </Text>

          <View
            style={{ marginTop: spacing.sm, flexDirection: "row", gap: 10 }}
          >
            <Pressable
              onPress={contactSellerOnWhatsApp}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
                WhatsApp
              </Text>
            </Pressable>

            <Pressable
              onPress={callSeller}
              disabled={!sellerPhone}
              style={({ pressed }) => ({
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: "center",
                backgroundColor: colors.surface,
                opacity: !sellerPhone ? 0.45 : pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                Call
              </Text>
            </Pressable>

            <Pressable
              onPress={shareProductInfo}
              style={({ pressed }) => ({
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: radius.md,
                alignItems: "center",
                backgroundColor: colors.surface,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                Share
              </Text>
            </Pressable>
          </View>

          {!sellerPhone ? (
            <Text
              style={{ marginTop: 8, color: colors.mutedText, fontSize: 12 }}
            >
              Seller phone not available right now.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        {/* Qty Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>
            {t("quantity")}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => qty > 0 && decItem(product.id)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
                opacity: qty > 0 ? 1 : 0.4,
              }}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>
                −
              </Text>
            </Pressable>

            <Text
              style={{ fontSize: 16, fontWeight: "900", color: colors.text }}
            >
              {qty}
            </Text>

            <Pressable
              onPress={() => {
                addItem(product);
                showToast("Added ✅");
              }}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>
                +
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Buttons Row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => {
              if (qty === 0) {
                addItem(product);
                showToast("Added to cart ✅");
              } else {
                router.push("/cart");
              }
            }}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: radius.md,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>
              {qty === 0 ? t("add_to_cart") : `${t("go_to_cart")} (${qty})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={openWhatsAppOrder}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 14,
              borderRadius: radius.md,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontWeight: "900", color: colors.text }}>
              {t("buy")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 110,
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
            <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
              {toast}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
