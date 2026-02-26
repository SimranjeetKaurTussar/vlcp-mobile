import { View, Text, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export default function Profile() {
  const { mode, setMode, colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
        Profile
      </Text>

      <Text style={{ marginTop: 24, color: colors.mutedText, fontWeight: "600" }}>
        Theme
      </Text>

      <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
        {(["light", "dark", "system"] as const).map((option) => {
          const active = mode === option;

          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text
                style={{
                  color: active ? colors.onPrimary : colors.text,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
