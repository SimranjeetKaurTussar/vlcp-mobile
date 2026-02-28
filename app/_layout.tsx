import { Stack } from "expo-router";
import { CartProvider } from "./lib/cart";
import { ThemeProvider } from "./theme/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false}} >
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
