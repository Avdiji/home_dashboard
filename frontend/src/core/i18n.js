// i18n bootstrap. The app's UI language follows the client's browser language
// (navigator), with `en` as the fallback for anything we don't catalog. No
// localStorage cache — the browser language is re-read on every load, so
// changing the OS/browser language and reloading switches the UI. A future
// manual language switcher would call i18n.changeLanguage(lang) and add
// "localStorage" to `caches` then; this module intentionally does not.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../assets/i18n/en.json";
import de from "../assets/i18n/de.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    supportedLngs: ["en", "de"],
    fallbackLng: "en",
    detection: {
      order: ["navigator", "htmlTag"],
      caches: [], // do not persist — browser language is the source of truth
    },
    interpolation: { escapeValue: false }, // React already escapes
  });

// Keep <html lang> in sync with the resolved language (a11y + spellcheck).
// resolvedLanguage is the language actually serving content, so a French
// browser (unsupported) gets lang="en" rather than lang="fr".
document.documentElement.lang = i18n.resolvedLanguage;
i18n.on("languageChanged", () => {
  document.documentElement.lang = i18n.resolvedLanguage;
});

export default i18n;