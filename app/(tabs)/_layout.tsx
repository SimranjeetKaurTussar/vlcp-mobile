import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "react-native";
import { useCart } from "../lib/cart";
import { useTheme } from "../theme/ThemeProvider";

export default function TabsLayout() {
  const { items } = useCart();
  const { colors } = useTheme();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 64,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: focused ? "800" : "500", fontSize: 12 }}>Home</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: focused ? "800" : "500", fontSize: 12 }}>
              Categories
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={size} color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: focused ? "800" : "500", fontSize: 12 }}>Cart</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontWeight: focused ? "800" : "500", fontSize: 12 }}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}
