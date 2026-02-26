import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";

export default function Login() {
  const [phone, setPhone] = useState("");

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "700" }}>Welcome 👋</Text>
      <Text style={{ marginTop: 6, opacity: 0.7 }}>
        Enter your phone number to continue
      </Text>

      <Text style={{ marginTop: 18, fontWeight: "600" }}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 9876543210"
        keyboardType="phone-pad"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 12,
          fontSize: 16,
        }}
      />

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={{
          marginTop: 14,
          backgroundColor: "black",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Continue
        </Text>
      </Pressable>
    </View>
  );
}