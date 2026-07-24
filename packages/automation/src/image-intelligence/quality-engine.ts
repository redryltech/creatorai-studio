import type { ImageQualityMetrics, ImageScenePlan } from './image.types';

export class QualityEngine {
  static score(plan: Omit<ImageScenePlan, 'quality' | 'confidence'>): ImageQualityMetrics {
    const promptLen = plan.masterPrompt.length;
    const promptQuality = Math.min(100, promptLen > 200 ? 90 : promptLen > 100 ? 70 : promptLen > 50 ? 50 : 30);
    const compositionScore = Math.min(100, (plan.composition.foreground.element ? 25 : 0) + (plan.composition.background.element ? 25 : 0) + (plan.composition.subjectPlacement ? 25 : 0) + (plan.composition.depthOfField !== 'infinite' ? 25 : 10));
    const lightingScore = Math.min(100, (plan.lighting.keyLight.intensity > 0 ? 30 : 0) + (plan.lighting.fillLight.intensity > 0 ? 20 : 0) + (plan.lighting.backLight.intensity > 0 ? 20 : 0) + (plan.lighting.lightingMood ? 30 : 0));
    const realismScore = Math.min(100, (plan.style.primary === 'photorealistic' || plan.style.primary === 'cinematic' ? 40 : 20) + (plan.style.renderQuality === 'ultra' ? 30 : plan.style.renderQuality === 'high' ? 20 : 10) + (plan.negativePrompt.length > 30 ? 30 : 15));
    const consistencyScore = Math.min(100, plan.identity.consistencyScore);
    const imageQuality = Math.min(100, promptLen > 100 ? 80 : 50);
    const overallScore = Math.round(imageQuality * 0.15 + promptQuality * 0.2 + compositionScore * 0.2 + lightingScore * 0.15 + realismScore * 0.15 + consistencyScore * 0.15);
    return { imageQuality, promptQuality, compositionScore, lightingScore, realismScore, consistencyScore, overallScore };
  }
}
