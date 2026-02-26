import { Stack } from "expo-router";
import { CartProvider } from "./lib/cart";

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </CartProvider>
  );
}