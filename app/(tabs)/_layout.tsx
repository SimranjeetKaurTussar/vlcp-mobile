import { Tabs, router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { getAuthToken, getStoredUserRole, type UserRole } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";
import { setUnauthorizedHandler } from "../lib/api";

export default function TabsLayout() {
  const { items } = useCart();
  const { colors } = useTheme();
  const [role, setRole] = useState<UserRole>("customer");
  const [authorized, setAuthorized] = useState(false);
  const [isHydratingRole, setIsHydratingRole] = useState(true);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  useFocusEffect(
    useCallback(() => {
      async function loadContext() {
        setIsHydratingRole(true);
        const token = await getAuthToken();

        if (!token) {
          setAuthorized(false);
          setRole("customer");
          setIsHydratingRole(false);
          router.replace("/login");
          return;
        }

        setAuthorized(true);
        const nextRole = await getStoredUserRole();
        setRole(nextRole);
        setIsHydratingRole(false);
      }

      loadContext();
    }, [])
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthorized(false);
      setRole("customer");
      setIsHydratingRole(false);
      router.replace("/login");
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  if (isHydratingRole) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!authorized) {
    return null;
  }

  // Role is the source of truth for tab rendering. Seller tab is only for role === "seller".
  const showSellerTab = role === "seller";
  // eslint-disable-next-line no-console
  console.log("[TabsLayout] auth.role for tabs:", role);

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
      {showSellerTab ? (
        <Tabs.Screen
          name="seller-hub"
          options={{
            title: "Seller",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? "storefront" : "storefront-outline"} size={size} color={color} />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text style={{ color, fontWeight: focused ? "800" : "500", fontSize: 12 }}>Seller</Text>
            ),
          }}
        />
      ) : null}
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
