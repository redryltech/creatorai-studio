export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh' | 'ar' | 'ru' | 'id' | 'th' | 'vi' | 'tr' | 'pl' | 'nl' | 'sv';
export interface LanguageInfo {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    region: string;
    ttsSupported: boolean;
    rtl: boolean;
}
export interface TranslatedScene {
    sceneId: string;
    sceneOrder: number;
    originalText: string;
    translatedText: string;
    language: SupportedLanguage;
    confidence: number;
    characterCount: number;
}
export interface TranslatedScript {
    language: SupportedLanguage;
    languageName: string;
    scenes: TranslatedScene[];
    fullNarration: string;
    title: string;
    description: string;
    hashtags: string[];
    totalCharacters: number;
    translationMethod: 'gemini_ai' | 'google_translate' | 'manual';
}
export interface TranslationPackage {
    id: string;
    productionTitle: string;
    sourceLanguage: SupportedLanguage;
    translations: TranslatedScript[];
    metadata: {
        totalLanguages: number;
        totalScenes: number;
        totalCharacters: number;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface TranslationMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    languageCount: number;
    createdAt: string;
}
//# sourceMappingURL=translation.types.d.ts.map