import { router } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { saveOrder, type LocalOrder } from "../lib/storage";
import { businessName, whatsappNumber } from "../lib/config";
import { useTheme } from "../theme/ThemeProvider";

export default function Cart() {
  const { items, addItem, decItem } = useCart();
  const { colors } = useTheme();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 0;
  const grandTotal = subtotal + deliveryFee;

  async function checkoutOnWhatsApp() {
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
      status: "Placed",
    };

    await saveOrder(order);

    const lines = items.map((item) => {
      const amount = item.price * item.qty;
      return `${item.name} x ${item.qty} = ₹${amount}`;
    });

    const message = `Hi ${businessName}, I want to order:\n${lines.join(
      "\n"
    )}\n\nSubtotal: ₹${subtotal}\nDelivery: ₹${deliveryFee}\nGrand Total: ₹${grandTotal}`;
    const encoded = encodeURIComponent(message);

    const appUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
    const webUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    const canOpenApp = await Linking.canOpenURL(appUrl);
    if (canOpenApp) {
      await Linking.openURL(appUrl);
      return;
    }

    const canOpenWeb = await Linking.canOpenURL(webUrl);
    if (canOpenWeb) {
      Alert.alert(
        "WhatsApp not installed",
        "No worries — opening WhatsApp web checkout in your browser."
      );
      await Linking.openURL(webUrl);
      return;
    }

    Alert.alert("Unable to open WhatsApp", "Please install WhatsApp and try again.");
  }

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
          Cart is empty 🛒
        </Text>
        <Text style={{ marginTop: 8, color: colors.mutedText }}>
          Add items from Home or Product pages.
        </Text>

        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 220 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>Your Cart</Text>

        {items.map((item) => {
          const lineTotal = item.price * item.qty;

          return (
            <View
              key={item.id}
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>{item.name}</Text>

              <Text style={{ marginTop: 4, color: colors.mutedText, fontSize: 13 }}>
                {item.seller} • {item.category}
              </Text>

              <Text style={{ marginTop: 4, color: colors.text }}>
                ₹{item.price} / {item.unit}
              </Text>

              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable
                    onPress={() => decItem(item.id)}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>-</Text>
                  </Pressable>

                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                    {item.qty}
                  </Text>

                  <Pressable
                    onPress={() => addItem(item)}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>+</Text>
                  </Pressable>
                </View>

                <Text style={{ fontWeight: "800", color: colors.text }}>
                  ₹{lineTotal}
                </Text>
              </View>
            </View>
          );
        })}

        <View
          style={{
            marginTop: 18,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: colors.surface,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.mutedText }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>₹{subtotal}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.mutedText }}>Delivery fee</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>₹{deliveryFee}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: 8,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "900" }}>Grand total</Text>
            <Text style={{ color: colors.text, fontWeight: "900" }}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
        }}
      >
        <Text style={{ color: colors.mutedText }}>Total amount</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 2 }}>
          ₹{grandTotal}
        </Text>

        <Pressable
          onPress={checkoutOnWhatsApp}
          style={{
            marginTop: 10,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
            Checkout on WhatsApp
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={checkoutOnWhatsApp}
        style={{
          marginTop: 14,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "800" }}>
          Checkout on WhatsApp
        </Text>
      </Pressable>
    </View>
  );
}
