import { Appearance, ColorSchemeName } from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { darkColors, lightColors, radius, spacing, typography } from "./tokens";
import { getStoredThemeMode, setStoredThemeMode, type ThemeMode } from "../lib/storage";
import { loadBusinessConfig } from "../lib/config";

type ResolvedMode = "light" | "dark";

type ThemeValue = {
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function resolveMode(mode: ThemeMode, system: ColorSchemeName): ResolvedMode {
  if (mode === "system") {
    return system === "dark" ? "dark" : "light";
  }

  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [isReady, setIsReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    async function bootstrap() {
      const storedMode = await getStoredThemeMode();
      if (storedMode) {
        setMode(storedMode);
      }

      await loadBusinessConfig();
      setIsReady(true);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setStoredThemeMode(mode);
  }, [isReady, mode]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const resolvedMode = resolveMode(mode, systemScheme);

  const value = useMemo<ThemeValue>(() => {
    return {
      mode,
      resolvedMode,
      setMode,
      colors: resolvedMode === "dark" ? darkColors : lightColors,
      spacing,
      radius,
      typography,
    };
  }, [mode, resolvedMode]);

  if (!isReady) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
