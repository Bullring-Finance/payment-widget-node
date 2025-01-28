import i18next from "i18next";
import enTranslations from "../locales/en";
import ptTranslations from "../locales/pt";

export const initializeI18n = () => {
    return i18next.init({
        resources: {
            en: { translation: enTranslations },
            pt: { translation: ptTranslations },
        },
        lng: navigator.language,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // Not needed for web components
        }
    });
};