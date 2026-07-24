// ============================================================
// CreatorAI Studio — Translation Planner
// ============================================================
// Translates scripts into multiple languages using Gemini AI.
// Maintains emotional tone, punchiness, and cultural relevance.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type {
  TranslationPackage, TranslatedScript, TranslatedScene,
  SupportedLanguage, LanguageInfo,
} from './translation.types';

const log = Logger.for('TranslationPlanner');

// ── Language database ──

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', region: 'Global', ttsSupported: true, rtl: false },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'India', ttsSupported: true, rtl: false },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'India', ttsSupported: true, rtl: false },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'India', ttsSupported: true, rtl: false },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'India', ttsSupported: true, rtl: false },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'India', ttsSupported: true, rtl: false },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'India', ttsSupported: true, rtl: false },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'India', ttsSupported: true, rtl: false },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'India', ttsSupported: true, rtl: false },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'India', ttsSupported: true, rtl: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Global', ttsSupported: true, rtl: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', region: 'Global', ttsSupported: true, rtl: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Europe', ttsSupported: true, rtl: false },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Global', ttsSupported: true, rtl: false },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Europe', ttsSupported: true, rtl: false },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Asia', ttsSupported: true, rtl: false },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Asia', ttsSupported: true, rtl: false },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'Asia', ttsSupported: true, rtl: false },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Middle East', ttsSupported: true, rtl: true },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Europe', ttsSupported: true, rtl: false },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia', ttsSupported: true, rtl: false },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Asia', ttsSupported: true, rtl: false },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia', ttsSupported: true, rtl: false },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Europe', ttsSupported: true, rtl: false },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Europe', ttsSupported: true, rtl: false },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Europe', ttsSupported: true, rtl: false },
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Europe', ttsSupported: true, rtl: false },
};

export class TranslationPlanner {
  /**
   * Translate a script into multiple languages using Gemini AI.
   */
  static async translate(
    scenes: Array<{ id: string; order: number; narration: string }>,
    title: string,
    targetLanguages: SupportedLanguage[],
    sourceLanguage: SupportedLanguage = 'en',
    geminiKey?: string,
  ): Promise<TranslationPackage> {
    const startTime = performance.now();

    log.info('Translation starting', {
      scenes: scenes.length,
      languages: targetLanguages.length,
      targets: targetLanguages.join(', '),
    });

    const translations: TranslatedScript[] = [];

    for (const lang of targetLanguages) {
      if (lang === sourceLanguage) continue;

      const langInfo = LANGUAGES[lang];
      if (!langInfo) continue;

      try {
        const translated = await TranslationPlanner.translateToLanguage(
          scenes, title, lang, langInfo, geminiKey,
        );
        translations.push(translated);
        log.info('Language translated', { language: langInfo.name, scenes: translated.scenes.length });
      } catch (err) {
        log.warn('Translation failed for language', { language: langInfo.name, error: (err as Error).message?.slice(0, 80) });
      }
    }

    const processingTimeMs = Math.round(performance.now() - startTime);
    const totalChars = translations.reduce((s, t) => s + t.totalCharacters, 0);

    log.info('Translation complete', { languages: translations.length, totalCharacters: totalChars, processingTimeMs });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: title,
      sourceLanguage,
      translations,
      metadata: {
        totalLanguages: translations.length,
        totalScenes: scenes.length,
        totalCharacters: totalChars,
        generatedAt: new Date().toISOString(),
        engine: 'translation-engine-v1',
        processingTimeMs,
      },
    };
  }

  /**
   * Translate to a single language using Gemini AI.
   */
  private static async translateToLanguage(
    scenes: Array<{ id: string; order: number; narration: string }>,
    title: string,
    lang: SupportedLanguage,
    langInfo: LanguageInfo,
    geminiKey?: string,
  ): Promise<TranslatedScript> {
    const key = geminiKey ?? process.env.GEMINI_API_KEY ?? '';

    if (!key) {
      // Fallback: return placeholder indicating translation needed
      return TranslationPlanner.buildPlaceholder(scenes, title, lang, langInfo);
    }

    // Build Gemini prompt
    const sceneTexts = scenes.map((s) => `Scene ${s.order}: "${s.narration}"`).join('\n');

    const prompt = `Translate the following YouTube Short script from English to ${langInfo.name} (${langInfo.nativeName}).

RULES:
- Keep the emotional intensity and punchiness
- Use natural spoken ${langInfo.name} (not overly formal)
- Maintain the same number of scenes
- Keep technical terms (like brand names, model numbers) in English
- Return ONLY valid JSON array of translated strings

Title: "${title}"

Scenes:
${sceneTexts}

Return JSON: {"title": "translated title", "scenes": ["scene 1 translation", "scene 2 translation", ...], "hashtags": ["#tag1", "#tag2", "#tag3"]}`;

    try {
      const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048, responseMimeType: 'application/json' },
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Gemini API ${response.status}`);
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      const parsed = JSON.parse(text);

      const translatedScenes: TranslatedScene[] = scenes.map((s, i) => ({
        sceneId: s.id,
        sceneOrder: s.order,
        originalText: s.narration,
        translatedText: parsed.scenes?.[i] ?? s.narration,
        language: lang,
        confidence: 0.9,
        characterCount: (parsed.scenes?.[i] ?? '').length,
      }));

      const fullNarration = translatedScenes.map((s) => s.translatedText).join(' ');

      return {
        language: lang,
        languageName: langInfo.name,
        scenes: translatedScenes,
        fullNarration,
        title: parsed.title ?? title,
        description: `${parsed.title ?? title} — ${langInfo.nativeName}`,
        hashtags: parsed.hashtags ?? [`#${langInfo.name}`, `#${title.split(' ')[0]}`],
        totalCharacters: fullNarration.length,
        translationMethod: 'gemini_ai',
      };
    } catch (err) {
      log.warn('Gemini translation failed, using placeholder', { lang, error: (err as Error).message?.slice(0, 60) });
      return TranslationPlanner.buildPlaceholder(scenes, title, lang, langInfo);
    }
  }

  /**
   * Build a placeholder translation (when API is unavailable).
   */
  private static buildPlaceholder(
    scenes: Array<{ id: string; order: number; narration: string }>,
    title: string,
    lang: SupportedLanguage,
    langInfo: LanguageInfo,
  ): TranslatedScript {
    return {
      language: lang,
      languageName: langInfo.name,
      scenes: scenes.map((s) => ({
        sceneId: s.id, sceneOrder: s.order,
        originalText: s.narration,
        translatedText: `[${langInfo.name}] ${s.narration}`,
        language: lang, confidence: 0, characterCount: s.narration.length,
      })),
      fullNarration: scenes.map((s) => `[${langInfo.name}] ${s.narration}`).join(' '),
      title: `[${langInfo.name}] ${title}`,
      description: `Translation pending for ${langInfo.name}`,
      hashtags: [`#${langInfo.name}`],
      totalCharacters: 0,
      translationMethod: 'manual' as const,
    };
  }

  /** Get list of all supported languages. */
  static getSupportedLanguages(): LanguageInfo[] {
    return Object.values(LANGUAGES);
  }

  /** Get Indian languages only. */
  static getIndianLanguages(): LanguageInfo[] {
    return Object.values(LANGUAGES).filter((l) => l.region === 'India');
  }
}
