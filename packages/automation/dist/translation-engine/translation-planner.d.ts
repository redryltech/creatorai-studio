import type { TranslationPackage, SupportedLanguage, LanguageInfo } from './translation.types';
export declare const LANGUAGES: Record<SupportedLanguage, LanguageInfo>;
export declare class TranslationPlanner {
    /**
     * Translate a script into multiple languages using Gemini AI.
     */
    static translate(scenes: Array<{
        id: string;
        order: number;
        narration: string;
    }>, title: string, targetLanguages: SupportedLanguage[], sourceLanguage?: SupportedLanguage, geminiKey?: string): Promise<TranslationPackage>;
    /**
     * Translate to a single language using Gemini AI.
     */
    private static translateToLanguage;
    /**
     * Build a placeholder translation (when API is unavailable).
     */
    private static buildPlaceholder;
    /** Get list of all supported languages. */
    static getSupportedLanguages(): LanguageInfo[];
    /** Get Indian languages only. */
    static getIndianLanguages(): LanguageInfo[];
}
//# sourceMappingURL=translation-planner.d.ts.map