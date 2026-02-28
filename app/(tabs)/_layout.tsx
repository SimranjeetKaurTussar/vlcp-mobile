import { Tabs, Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { getAuthToken, getStoredUserRole, type UserRole } from "../lib/storage";
import { useTheme } from "../theme/ThemeProvider";
import { setUnauthorizedHandler } from "../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { items } = useCart();
  const { colors } = useTheme();

  const [role, setRole] = useState<UserRole>("customer");
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = loading
  const [isHydrating, setIsHydrating] = useState(true);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const loadContext = useCallback(async () => {
    setIsHydrating(true);

    const token = await getAuthToken();
    if (!token) {
      setAuthorized(false);
      setRole("customer");
      setIsHydrating(false);
      return;
    }

    setAuthorized(true);
    const nextRole = await getStoredUserRole();
    setRole(nextRole || "customer");
    setIsHydrating(false);
  }, []);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  useEffect(() => {
    // IMPORTANT: Do NOT router.replace here. Just flip auth state.
    setUnauthorizedHandler(() => {
      setAuthorized(false);
      setRole("customer");
      setIsHydrating(false);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  // Loading screen (safe)
  if (isHydrating || authorized === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // If not authorized, redirect safely (NO router.replace)
  if (!authorized) {
    return <Redirect href="/login" />;
  }

  const showSellerTab = role === "seller";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
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
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? "600" : "500",
                  fontSize: 12,
                }}
              >
                Home
              </Text>
            ),
          }}
        />

        <Tabs.Screen
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? "600" : "500",
                  fontSize: 12,
                }}
              >
                Categories
              </Text>
            ),
          }}
        />

        {/* Keep route name constant. Hide with ZERO-SIZE button (NOT null) */}
        <Tabs.Screen
          name="seller-hub"
          options={{
            title: "Seller",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "storefront" : "storefront-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? "600" : "500",
                  fontSize: 12,
                }}
              >
                Seller
              </Text>
            ),
            tabBarButton: ({ ref: _ref, ...props }) => {
              if (showSellerTab) return <Pressable {...props} />;

              // Hidden but stable (no crash)
              return (
                <Pressable
                  {...props}
                  disabled
                  style={{
                    width: 0,
                    height: 0,
                    opacity: 0,
                  }}
                />
              );
            },
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarBadge: count > 0 ? count : undefined,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "cart" : "cart-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? "600" : "500",
                  fontSize: 12,
                }}
              >
                Cart
              </Text>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? "600" : "500",
                  fontSize: 12,
                }}
              >
                Profile
              </Text>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
