import { useGameStore } from "./store";
import { TRANSLATIONS, TranslationSet } from "./translations";

export function useTranslation(): { t: TranslationSet; lang: "en" | "km" } {
  const immersionMode = useGameStore((state) => state.immersionMode);
  const lang = immersionMode ? "km" : "en";
  return { t: TRANSLATIONS[lang], lang };
}
