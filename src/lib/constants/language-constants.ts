export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  isDefault?: boolean;
}

export const availableLanguages: LanguageOption[] = [
  {
    code: 'en-US',
    name: 'English (US)',
    flag: '🇺🇸',
    isDefault: true,
  },
  {
    code: 'en-IN',
    name: 'English (India)',
    flag: '🇮🇳',
  },
];

// Get browser's language and match with available options
export const getBrowserLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language || navigator.languages?.[0];

    // Check if browser language matches any of our available languages
    const matchedLang = availableLanguages.find(
      (lang) =>
        lang.code === browserLang ||
        lang.code.startsWith(browserLang) ||
        browserLang.startsWith(lang.code.split('-')[0])
    );

    return matchedLang?.code || availableLanguages[0].code;
  }

  return availableLanguages[0].code; // Default to en-US
};
