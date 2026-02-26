import { Tabs } from "expo-router";
import { useCart } from "../lib/cart";
import { useTheme } from "../theme/ThemeProvider";

export default function TabsLayout() {
  const { items } = useCart();
  const { colors } = useTheme();
  const count = items.reduce((sum, i) => sum + i.qty, 0); // qty based cart

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="categories" options={{ title: "Categories" }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
