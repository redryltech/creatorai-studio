// ============================================================
// CreatorAI Studio — Continuity Engine
// ============================================================
// Detects consistency violations across scenes and generates
// repair suggestions with corrected prompts.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { Storyboard, StoryboardFrame } from '../storyboard/storyboard.types';
import type { EntityIdentity, ContinuityIssue, ContinuityReport } from './character.types';
import { SeedManager } from './seed-manager';

const log = Logger.for('ContinuityEngine');

export class ContinuityEngine {
  /**
   * Analyze a storyboard for continuity issues across all scenes.
   */
  static analyze(
    storyboard: Storyboard,
    entities: EntityIdentity[],
    seedManager: SeedManager,
  ): ContinuityReport {
    const issues: ContinuityIssue[] = [];
    const entityScores: Record<string, number> = {};

    // Initialize scores
    for (const entity of entities) {
      entityScores[entity.id] = 100;
    }

    const frames = storyboard.frames;

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]!;
      const prev = i > 0 ? frames[i - 1]! : null;

      // Check each entity for continuity in this frame
      for (const entity of entities) {
        if (!entity.scenePresence.includes(frame.sceneId)) continue;

        // ── Vehicle continuity ──
        if (entity.vehicleProfile && entity.category === 'vehicle') {
          const vp = entity.vehicleProfile;
          const frameText = `${frame.frameDescription} ${frame.prompts.imagePrompt}`.toLowerCase();

          // Check color consistency
          if (prev && entity.scenePresence.includes(prev.sceneId)) {
            const prevText = `${prev.frameDescription} ${prev.prompts.imagePrompt}`.toLowerCase();
            // Detect if a different color is mentioned
            const wrongColors = ['red', 'blue', 'white', 'silver', 'orange', 'yellow'].filter((c) =>
              c !== vp.primaryColor.toLowerCase() && frameText.includes(c) && !prevText.includes(c),
            );
            if (wrongColors.length > 0) {
              issues.push({
                sceneId: frame.sceneId,
                entityId: entity.id,
                issueType: 'wrong_color',
                severity: 'critical',
                description: `Vehicle color inconsistency: found "${wrongColors.join(', ')}" but expected "${vp.primaryColor}"`,
                repair: {
                  correctedPrompt: `${vp.primaryColor} ${vp.manufacturer} ${vp.model}`,
                  correctedIdentity: entity.identityBlock,
                  missingAssets: [],
                  recommendedSeed: seedManager.sceneSeed(entity.id, frame.sceneId),
                  continuityScore: 60,
                },
              });
              entityScores[entity.id] = Math.max(0, (entityScores[entity.id] ?? 100) - 20);
            }
          }

          // Check for missing vehicle parts
          const requiredParts = entity.appearance.requiredVehicleParts;
          for (const part of requiredParts) {
            // If the part was visible before but not mentioned now (soft check)
            if (part && prev && entity.scenePresence.includes(prev.sceneId)) {
              // This is an informational check — parts may not always be visible
            }
          }
        }

        // ── Character continuity ──
        if (entity.characterProfile && entity.category === 'human') {
          const cp = entity.characterProfile;

          if (prev && entity.scenePresence.includes(prev.sceneId)) {
            // Check clothing consistency
            const frameText = `${frame.frameDescription} ${frame.prompts.imagePrompt}`.toLowerCase();
            const clothingKeywords = cp.clothing.overall.toLowerCase().split(/\s+/);

            // If a contradicting clothing item appears
            const contradictions = ['suit', 'dress', 'shorts', 'swimwear', 'pajamas'].filter((c) =>
              frameText.includes(c) && !cp.clothing.overall.toLowerCase().includes(c),
            );
            if (contradictions.length > 0) {
              issues.push({
                sceneId: frame.sceneId,
                entityId: entity.id,
                issueType: 'different_clothing',
                severity: 'warning',
                description: `Clothing mismatch: found "${contradictions.join(', ')}" but expected "${cp.clothing.overall.slice(0, 40)}"`,
                repair: {
                  correctedPrompt: `wearing ${cp.clothing.overall}`,
                  correctedIdentity: entity.identityBlock,
                  missingAssets: contradictions,
                  recommendedSeed: seedManager.sceneSeed(entity.id, frame.sceneId),
                  continuityScore: 75,
                },
              });
              entityScores[entity.id] = Math.max(0, (entityScores[entity.id] ?? 100) - 10);
            }

            // Check for missing accessories
            if (cp.helmet && prev) {
              const prevHadHelmet = prev.prompts.imagePrompt.toLowerCase().includes('helmet');
              const currentHasHelmet = frameText.includes('helmet');
              if (prevHadHelmet && !currentHasHelmet && entity.scenePresence.includes(frame.sceneId)) {
                issues.push({
                  sceneId: frame.sceneId,
                  entityId: entity.id,
                  issueType: 'missing_accessory',
                  severity: 'info',
                  description: `Helmet was visible in scene ${prev.sceneOrder} but not in scene ${frame.sceneOrder}`,
                  repair: {
                    correctedPrompt: `wearing ${cp.helmet}`,
                    correctedIdentity: entity.identityBlock,
                    missingAssets: [cp.helmet],
                    recommendedSeed: seedManager.sceneSeed(entity.id, frame.sceneId),
                    continuityScore: 85,
                  },
                });
                entityScores[entity.id] = Math.max(0, (entityScores[entity.id] ?? 100) - 5);
              }
            }
          }
        }

        // ── Environment continuity ──
        if (prev) {
          // Weather mismatch within same logical sequence
          const prevWeather = prev.style.mood;
          const currWeather = frame.style.mood;
          // Only flag if adjacent scenes have drastically different weather
          if (frame.continuity.weather.includes('CHANGED')) {
            issues.push({
              sceneId: frame.sceneId,
              entityId: 'environment',
              issueType: 'weather_mismatch',
              severity: 'info',
              description: `Weather changed between scene ${prev.sceneOrder} and ${frame.sceneOrder}`,
              repair: {
                correctedPrompt: frame.prompts.imagePrompt,
                correctedIdentity: '',
                missingAssets: [],
                recommendedSeed: 0,
                continuityScore: 90,
              },
            });
          }

          // Lighting mismatch
          if (prev.style.lightingSummary !== frame.style.lightingSummary) {
            // Only flag if continuity grade changes
            if (prev.continuity.colorGrading !== frame.continuity.colorGrading) {
              issues.push({
                sceneId: frame.sceneId,
                entityId: 'environment',
                issueType: 'lighting_mismatch',
                severity: 'warning',
                description: `Color grading changed: "${prev.continuity.colorGrading}" → "${frame.continuity.colorGrading}"`,
                repair: {
                  correctedPrompt: `${frame.prompts.imagePrompt}, maintain ${prev.continuity.colorGrading} color grading`,
                  correctedIdentity: '',
                  missingAssets: [],
                  recommendedSeed: 0,
                  continuityScore: 80,
                },
              });
            }
          }
        }
      }
    }

    // Compute overall score
    const scores = Object.values(entityScores);
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100;

    log.info('Continuity analysis complete', {
      scenes: frames.length,
      entities: entities.length,
      issues: issues.length,
      critical: issues.filter((i) => i.severity === 'critical').length,
      overallScore,
    });

    return {
      productionId: storyboard.id,
      totalScenes: frames.length,
      issues,
      overallScore,
      entityScores,
    };
  }
}
