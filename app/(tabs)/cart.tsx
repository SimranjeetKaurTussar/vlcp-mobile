import { router } from "expo-router";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../lib/cart";
import {
  getStoredBusinessName,
  getStoredPlatformUpiId,
  saveOrder,
  type LocalOrder,
} from "../lib/storage";
import { businessName, platformUpiId, whatsappNumber } from "../lib/config";
import { useTheme } from "../theme/ThemeProvider";
import { useT } from "../i18n/useT";

export default function Cart() {
  const { items, addItem, decItem, clearCart } = useCart();
  const { colors, spacing, radius, fontSizes, shadows } = useTheme();
  const { t } = useT();
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [savedBusinessName, setSavedBusinessName] = useState(businessName);
  const [savedReceiverUpiId, setSavedReceiverUpiId] = useState(platformUpiId);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 0;
  const grandTotal = subtotal + deliveryFee;

  const totalPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function loadPaymentSettings() {
      const storedBusinessName = await getStoredBusinessName();
      const storedUpiId = await getStoredPlatformUpiId();
      setSavedBusinessName(storedBusinessName || businessName);
      setSavedReceiverUpiId(storedUpiId || platformUpiId);
    }

    loadPaymentSettings();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(totalPulseAnim, { toValue: 1.08, duration: 120, useNativeDriver: true }),
      Animated.timing(totalPulseAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [grandTotal, totalPulseAnim]);

  const upiPaymentUrl = useMemo(() => {
    const amount = grandTotal.toFixed(2);
    return `upi://pay?pa=${encodeURIComponent(savedReceiverUpiId)}&pn=${encodeURIComponent(
      savedBusinessName
    )}&am=${encodeURIComponent(amount)}&cu=INR`;
  }, [grandTotal, savedBusinessName, savedReceiverUpiId]);

  function confirmClearCart() {
    Alert.alert("Clear cart", "Remove all items from cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCart },
    ]);
  }

  async function checkoutOnWhatsApp() {
    const cleanWhatsAppNumber = whatsappNumber.replace(/\D/g, "");
    if (!cleanWhatsAppNumber || cleanWhatsAppNumber.includes("X")) {
      Alert.alert("WhatsApp number missing", "Please set a valid WhatsApp number in Profile settings.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Cart is empty", "Please add items before checkout.");
      return;
    }

    const order: LocalOrder = {
      id: `o_${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        unit: item.unit,
      })),
      total: grandTotal,
      status: "Pending",
      paymentReceiverType: "platform",
      receiverUpiId: savedReceiverUpiId.trim(),
    };

    await saveOrder(order);

    const permissions = await Notifications.requestPermissionsAsync();
    if (permissions.status === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: { title: "VLCP", body: "Order sent to seller" },
        trigger: null,
      });
    }

    const lines = items.map((item) => `${item.name} x ${item.qty} = ₹${item.price * item.qty}`);
    const message = `Hi ${businessName}, I want to order:\n${lines.join(
      "\n"
    )}\n\nSubtotal: ₹${subtotal}\nDelivery: ₹${deliveryFee}\nGrand Total: ₹${grandTotal}`;

    const encoded = encodeURIComponent(message);
    const appUrl = `whatsapp://send?phone=${cleanWhatsAppNumber}&text=${encoded}`;
    const webUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encoded}`;

    const canOpenApp = await Linking.canOpenURL(appUrl);
    if (canOpenApp) {
      await Linking.openURL(appUrl);
      return;
    }

    const canOpenWeb = await Linking.canOpenURL(webUrl);
    if (canOpenWeb) {
      Alert.alert("WhatsApp not installed", "No worries — opening WhatsApp web checkout in your browser.");
      await Linking.openURL(webUrl);
      return;
    }

    Alert.alert("Unable to open WhatsApp", "Please install WhatsApp and try again.");
  }

  async function openUpiApp() {
    if (!savedReceiverUpiId.trim()) {
      Alert.alert("Please set payment receiver UPI in Profile settings");
      return;
    }

    const canOpen = await Linking.canOpenURL(upiPaymentUrl);
    if (!canOpen) {
      Alert.alert("UPI app not found", "Please install a UPI app to continue.");
      return;
    }

    await Linking.openURL(upiPaymentUrl);
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background }}>
        <Text style={{ fontSize: fontSizes.subtitle + 2, fontWeight: "800", color: colors.text }}>
          {t("cart_empty")} 🛒
        </Text>
        <View style={{ marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, alignSelf: "stretch", ...shadows.card }}>
          <Text style={{ color: colors.mutedText, textAlign: "center" }}>Add items from Home or Product pages.</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={({ pressed }) => ({ marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md, opacity: pressed ? 0.9 : 1 })}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 240 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: fontSizes.subtitle + 4, fontWeight: "800", color: colors.text }}>Your Cart</Text>
          <Pressable
            onPress={confirmClearCart}
            style={({ pressed }) => ({ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 })}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>Clear cart</Text>
          </Pressable>
        </View>

        {items.map((item) => (
          <View key={item.id} style={{ marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.sm, backgroundColor: colors.surface, ...shadows.card }}>
            <Text style={{ fontWeight: "800", color: colors.text }}>{item.name}</Text>
            <Text style={{ marginTop: 4, color: colors.mutedText, fontSize: 13 }}>{item.seller} • {item.category}</Text>
            <Text style={{ marginTop: 4, color: colors.text }}>₹{item.price} / {item.unit}</Text>

            <View style={{ marginTop: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Pressable onPress={() => decItem(item.id)} style={({ pressed }) => ({ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, opacity: pressed ? 0.9 : 1 })}>
                  <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>-</Text>
                </Pressable>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{item.qty}</Text>
                <Pressable onPress={() => addItem(item)} style={({ pressed }) => ({ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, opacity: pressed ? 0.9 : 1 })}>
                  <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>+</Text>
                </Pressable>
              </View>
              <Text style={{ fontWeight: "800", color: colors.text }}>₹{item.price * item.qty}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg, ...shadows.raised }}>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, backgroundColor: colors.background }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.mutedText }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>₹{subtotal}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Text style={{ color: colors.mutedText }}>Delivery fee</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>₹{deliveryFee}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>Grand Total</Text>
            <Animated.Text
              style={{
                color: colors.text,
                fontSize: fontSizes.subtitle,
                fontWeight: "900",
                transform: [{ scale: totalPulseAnim }],
                opacity: totalPulseAnim.interpolate({ inputRange: [1, 1.08], outputRange: [1, 0.88] }),
              }}
            >
              ₹{grandTotal}
            </Animated.Text>
          </View>
          <Text style={{ color: colors.mutedText, fontSize: 12, marginTop: 6 }}>Prices are demo</Text>
        </View>

        <Pressable onPress={checkoutOnWhatsApp} style={({ pressed }) => ({ marginTop: spacing.sm, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: "center", opacity: pressed ? 0.9 : 1 })}>
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{t("checkout_whatsapp")}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!savedReceiverUpiId.trim()) {
              Alert.alert("Please set payment receiver UPI in Profile settings");
              return;
            }

            setShowUpiModal(true);
          }}
          style={({ pressed }) => ({ marginTop: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: radius.md, alignItems: "center", opacity: pressed ? 0.9 : 1 })}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>{t("pay_via_upi")}</Text>
        </Pressable>
      </View>

      <Modal visible={showUpiModal} transparent animationType="slide" onRequestClose={() => setShowUpiModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.subtitle + 2, fontWeight: "800" }}>{t("pay_via_upi")}</Text>
            <Text style={{ color: colors.mutedText, marginTop: 6 }}>Receiver: Platform</Text>
            <Text style={{ color: colors.mutedText, marginTop: 4 }}>UPI ID: {savedReceiverUpiId || "Not set in Profile settings"}</Text>
            <Text style={{ color: colors.text, marginTop: 4, fontWeight: "700" }}>Amount: ₹{grandTotal.toFixed(2)}</Text>

            <View style={{ alignItems: "center", marginTop: spacing.md }}>
              {savedReceiverUpiId ? (
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPaymentUrl)}` }}
                  style={{ width: 180, height: 180, borderRadius: radius.md, backgroundColor: "#FFFFFF" }}
                />
              ) : (
                <Text style={{ color: colors.mutedText, textAlign: "center" }}>Add your UPI ID in Profile to generate a payment QR.</Text>
              )}
            </View>

            <Pressable onPress={openUpiApp} style={({ pressed }) => ({ marginTop: spacing.md, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: "center", opacity: pressed ? 0.9 : 1 })}>
              <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>{t("open_upi_app")}</Text>
            </Pressable>

            <Pressable onPress={() => setShowUpiModal(false)} style={({ pressed }) => ({ marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, borderRadius: radius.md, alignItems: "center", opacity: pressed ? 0.9 : 1 })}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
