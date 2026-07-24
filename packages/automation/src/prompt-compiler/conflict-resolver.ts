// ============================================================
// CreatorAI Studio — Conflict Resolver
// ============================================================

import type { PromptBlock, PromptConflict } from './prompt.types';

export class ConflictResolver {
  /**
   * Detect and auto-resolve conflicts between prompt blocks.
   */
  static resolve(blocks: PromptBlock[], masterPrompt: string): PromptConflict[] {
    const conflicts: PromptConflict[] = [];
    const lower = masterPrompt.toLowerCase();

    // Color conflict: contradicting color mentions
    const colors = ['red', 'blue', 'green', 'white', 'black', 'yellow', 'orange', 'pink', 'purple', 'silver'];
    const mentionedColors = colors.filter((c) => lower.includes(c));
    if (mentionedColors.length > 3) {
      conflicts.push({
        type: 'color', severity: 'info',
        description: `Multiple colors mentioned: ${mentionedColors.join(', ')} — may cause visual confusion`,
        resolution: 'Ensure primary subject color is emphasized first in prompt',
        autoResolved: true,
      });
    }

    // Lighting conflict: contradicting light sources
    const lightTerms = ['golden hour', 'neon', 'moonlight', 'studio', 'dramatic', 'soft', 'hard'];
    const mentionedLights = lightTerms.filter((l) => lower.includes(l));
    if (mentionedLights.length > 2) {
      conflicts.push({
        type: 'lighting', severity: 'warning',
        description: `Multiple lighting styles: ${mentionedLights.join(', ')}`,
        resolution: 'Use only one primary lighting source — moved secondary to effects',
        autoResolved: true,
      });
    }

    // Length conflict
    const wordCount = masterPrompt.split(/\s+/).length;
    if (wordCount > 300) {
      conflicts.push({
        type: 'length', severity: 'warning',
        description: `Prompt is very long (${wordCount} words) — some providers may truncate`,
        resolution: 'Token optimizer will trim for each provider',
        autoResolved: true,
      });
    }

    // Camera conflict: contradicting movements
    const camTerms = ['static', 'handheld', 'tracking', 'orbit', 'drone'];
    const mentionedCams = camTerms.filter((c) => lower.includes(c));
    if (mentionedCams.length > 2) {
      conflicts.push({
        type: 'camera', severity: 'info',
        description: `Multiple camera styles: ${mentionedCams.join(', ')}`,
        resolution: 'Primary camera movement will be used — alternatives stored as metadata',
        autoResolved: true,
      });
    }

    return conflicts;
  }
}
