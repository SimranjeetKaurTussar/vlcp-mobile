import { View, Text, ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Home</Text>
      <Text style={{ marginTop: 6, opacity: 0.7 }}>
        Organic & Handmade products from your village.
      </Text>

      <View
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Today’s Pick</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>
          We will show featured products here next.
        </Text>
      </View>
    </ScrollView>
  );
}