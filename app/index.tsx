import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getAuthToken } from "./lib/storage";

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(async () => {
      const token = await getAuthToken();
      router.replace(token ? "/(tabs)" : "/login");
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>VLCP</Text>
      <Text style={{ marginTop: 6, opacity: 0.7 }}>Village Local Commerce</Text>
      <View style={{ marginTop: 18 }}>
        <ActivityIndicator />
      </View>
    </View>
  );
}
