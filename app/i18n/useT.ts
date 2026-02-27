import { useEffect, useState } from "react";
import en from "./en";
import pa from "./pa";
import { getStoredLanguage, setStoredLanguage, type AppLanguage } from "../lib/storage";

type Dictionary = typeof en;
type TranslationKey = keyof Dictionary;

type Listener = (language: AppLanguage) => void;
const listeners = new Set<Listener>();
let currentLanguage: AppLanguage = "pa";

export async function setLanguage(language: AppLanguage) {
  currentLanguage = language;
  await setStoredLanguage(language);
  listeners.forEach((listener) => listener(language));
}

export function useT() {
  const [language, setLanguageState] = useState<AppLanguage>(currentLanguage);

  useEffect(() => {
    let active = true;

    async function loadLanguage() {
      const saved = await getStoredLanguage();
      currentLanguage = saved;

      if (active) {
        setLanguageState(saved);
      }
    }

    const listener: Listener = (nextLanguage) => {
      setLanguageState(nextLanguage);
    };

    listeners.add(listener);
    loadLanguage();

    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, []);

  function t(key: TranslationKey): string {
    const activeDictionary = language === "pa" ? pa : en;
    return activeDictionary[key] ?? en[key] ?? key;
  }

  return { t, language, setLanguage };
}
