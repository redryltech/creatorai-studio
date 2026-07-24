import type { TitleAnalysis, TitleVariation } from './creator.types';
export class TitleEngine {
  static analyze(topic: string, currentTitle: string): TitleAnalysis {
    const base = topic.split('–')[0]?.trim().split('-')[0]?.trim() ?? topic;
    const variations: TitleVariation[] = [
      { title: currentTitle, score: 0, clickbaitRisk: 0, lengthStatus: 'ok', emotionalPull: 0, clarityScore: 0 },
      { title: `${base} — Everything You Need to Know 🔥`, score: 0, clickbaitRisk: 15, lengthStatus: 'ok', emotionalPull: 60, clarityScore: 85 },
      { title: `Why ${base} Is Still The Best Choice in 2024`, score: 0, clickbaitRisk: 20, lengthStatus: 'ok', emotionalPull: 70, clarityScore: 80 },
      { title: `${base} — Honest Review After 1 Year`, score: 0, clickbaitRisk: 10, lengthStatus: 'ok', emotionalPull: 65, clarityScore: 90 },
      { title: `5 Reasons ${base} Dominates 🏆`, score: 0, clickbaitRisk: 25, lengthStatus: 'ok', emotionalPull: 75, clarityScore: 75 },
      { title: `${base} — Features, Price & Performance`, score: 0, clickbaitRisk: 5, lengthStatus: 'ok', emotionalPull: 40, clarityScore: 95 },
    ];
    for (const v of variations) {
      v.lengthStatus = v.title.length > 70 ? 'too_long' : v.title.length < 15 ? 'too_short' : 'ok';
      const hasEmoji = /[\u{1F600}-\u{1F9FF}]/u.test(v.title) ? 10 : 0;
      const hasNumber = /\d/.test(v.title) ? 8 : 0;
      const hasQuestion = v.title.includes('?') ? 7 : 0;
      const lengthScore = v.lengthStatus === 'ok' ? 20 : 5;
      v.emotionalPull = v.emotionalPull || Math.min(100, 40 + hasEmoji * 2 + hasQuestion * 5);
      v.clarityScore = v.clarityScore || Math.min(100, 60 + lengthScore);
      v.score = Math.round(v.clarityScore * 0.35 + v.emotionalPull * 0.25 + (100 - v.clickbaitRisk) * 0.2 + lengthScore * 0.1 + hasEmoji + hasNumber + hasQuestion);
    }
    variations.sort((a, b) => b.score - a.score);
    const suggestions = ['Include primary keyword in first 3 words', 'Add an emoji for higher CTR', 'Keep under 60 characters for mobile', 'Use numbers (Top 5, 3 Reasons) for clarity'];
    return { variations, bestTitle: variations[0]!.title, bestScore: variations[0]!.score, averageScore: Math.round(variations.reduce((s, v) => s + v.score, 0) / variations.length), suggestions };
  }
}
