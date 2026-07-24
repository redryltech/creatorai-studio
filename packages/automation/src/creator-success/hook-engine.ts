import type { HookAnalysis } from './creator.types';
export class HookEngine {
  static analyze(hookText: string, totalDuration: number): HookAnalysis {
    const words = hookText.split(/\s+/);
    const hasQuestion = hookText.includes('?');
    const hasBoldClaim = /most|best|never|always|secret|truth|shocking/i.test(hookText);
    const hasNumber = /\d/.test(hookText);
    const wordCount = words.length;
    const openingSentenceScore = Math.min(100, (hasQuestion ? 25 : 10) + (hasBoldClaim ? 25 : 10) + (hasNumber ? 15 : 5) + Math.min(25, (wordCount > 5 && wordCount < 20 ? 25 : 10)));
    const first3 = Math.min(100, openingSentenceScore + (wordCount < 15 ? 15 : 0));
    const first10 = Math.min(100, first3 * 0.6 + 30);
    const visualImpact = Math.min(100, 50 + (hasBoldClaim ? 20 : 0) + (hasQuestion ? 15 : 0) + 15);
    const attentionScore = Math.round((first3 * 0.35 + first10 * 0.25 + openingSentenceScore * 0.2 + visualImpact * 0.2));
    const improvements: string[] = [];
    if (!hasQuestion) improvements.push('Start with a question to create curiosity');
    if (!hasBoldClaim) improvements.push('Add a bold claim or surprising statement');
    if (!hasNumber) improvements.push('Include a number for specificity');
    if (wordCount > 20) improvements.push('Shorten hook — first 2 seconds decide everything');
    improvements.push('Match visual intensity to verbal hook');
    improvements.push('Use pattern interrupt (unexpected visual/sound)');
    return { first3SecondsScore: first3, first10SecondsScore: first10, openingSentenceScore, visualImpactScore: visualImpact, attentionScore, improvements };
  }
}
