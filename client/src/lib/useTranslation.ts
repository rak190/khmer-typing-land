import { TRANSLATIONS, TranslationSet } from "./translations";

export function useTranslation(): { t: TranslationSet; lang: "en" | "km" } {
  const lang = "km";
  return { t: TRANSLATIONS[lang], lang };
}
