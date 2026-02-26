import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { categories } from "../lib/data";
import { useTheme } from "../theme/ThemeProvider";

export default function Categories() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
          Categories
        </Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          Browse products by category
        </Text>

        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => router.push(`/category/${encodeURIComponent(category.name)}`)}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: 999,
                paddingVertical: 10,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
