import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { categories } from "../lib/data";
import { useTheme } from "../theme/ThemeProvider";

export default function Categories() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
          Categories
        </Text>
        <Text style={{ marginTop: 6, color: colors.mutedText }}>
          Browse products by category
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search categories..."
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {filteredCategories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => router.push(`/category/${encodeURIComponent(category.name)}`)}
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                  backgroundColor: colors.background,
                }}
              >
                <Text style={{ color: colors.mutedText, fontWeight: "700" }}>#</Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredCategories.length === 0 ? (
          <Text style={{ marginTop: 14, color: colors.mutedText }}>
            No categories found.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
