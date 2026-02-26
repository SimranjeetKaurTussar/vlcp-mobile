import { Stack } from "expo-router";
import { CartProvider } from "./lib/cart";
import { ThemeProvider } from "./theme/ThemeProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </CartProvider>
    </ThemeProvider>
  );
}
