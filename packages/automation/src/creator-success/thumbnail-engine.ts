import type { ThumbnailAnalysis } from './creator.types';
export class ThumbnailEngine {
  static analyze(hasText: boolean, hasSubject: boolean, hasContrast: boolean): ThumbnailAnalysis {
    const textReadability = hasText ? 75 : 40;
    const visualHierarchy = hasSubject ? 80 : 50;
    const subjectFocus = hasSubject ? 85 : 45;
    const contrast = hasContrast ? 80 : 55;
    const composition = (textReadability + visualHierarchy + subjectFocus) / 3;
    const ctrPrediction = Math.round((textReadability * 0.2 + visualHierarchy * 0.2 + subjectFocus * 0.25 + contrast * 0.15 + composition * 0.2));
    const overallScore = Math.round(ctrPrediction);
    const improvements: string[] = [];
    if (!hasText) improvements.push('Add bold text overlay (3-5 words max)');
    if (!hasSubject) improvements.push('Ensure main subject fills 60%+ of frame');
    if (!hasContrast) improvements.push('Increase contrast between subject and background');
    improvements.push('Use bright colors (yellow, red, white) for text');
    improvements.push('Add a face or eyes for 38% higher CTR');
    improvements.push('Use 1280x720 minimum resolution');
    return { textReadability, visualHierarchy, subjectFocus, contrast, composition: Math.round(composition), ctrPrediction, overallScore, improvements };
  }
}
