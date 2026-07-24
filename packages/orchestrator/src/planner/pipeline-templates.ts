// ============================================================
// CreatorAI Studio — Pipeline Templates
// ============================================================
// Pre-built pipeline templates for common workflows.
// The Plan Builder selects a template based on parsed intent
// and customizes it with the user's parameters.
// ============================================================

import { AgentId, StepStatus } from '@creatorai/shared';
import type { PipelineStep } from '@creatorai/shared';

/**
 * Template definition — describes the step sequence and dependencies.
 */
export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  steps: PipelineStepTemplate[];
}

export interface PipelineStepTemplate {
  id: string;
  agentId: AgentId;
  name: string;
  description: string;
  dependsOn: string[];
  maxRetries: number;
  estimatedDurationSec: number;
  optional: boolean; // If true, pipeline continues even if this step fails
}

/**
 * Convert a template step to a pipeline step (with default values).
 */
export function templateStepToPipelineStep(
  template: PipelineStepTemplate,
  input: Record<string, unknown> = {},
): PipelineStep {
  return {
    id: template.id,
    agentId: template.agentId,
    name: template.name,
    description: template.description,
    status: StepStatus.PENDING,
    input,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    retryCount: 0,
    maxRetries: template.maxRetries,
    dependsOn: template.dependsOn,
    estimatedDurationSec: template.estimatedDurationSec,
    actualDurationSec: null,
    progress: 0,
  };
}

// ---- Pipeline Templates ----

/**
 * Full video creation pipeline — the main workflow.
 * trend → script → prompt → [image + voice] → editor → [thumbnail + seo]
 */
export const FULL_VIDEO_PIPELINE: PipelineTemplate = {
  id: 'full_video',
  name: 'Full Video Creation',
  description: 'End-to-end video creation: research → script → media generation → editing → SEO',
  steps: [
    {
      id: 'trend_research',
      agentId: AgentId.TREND,
      name: 'Trend Research',
      description: 'Research trending topics and select the best content idea',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 10,
      optional: true, // Can skip if user provided a specific topic
    },
    {
      id: 'script_generation',
      agentId: AgentId.SCRIPT,
      name: 'Script Writing',
      description: 'Generate a professional script with scene breakdown',
      dependsOn: ['trend_research'],
      maxRetries: 2,
      estimatedDurationSec: 15,
      optional: false,
    },
    {
      id: 'prompt_generation',
      agentId: AgentId.PROMPT,
      name: 'Visual Prompt Generation',
      description: 'Generate AI image/video prompts for each scene',
      dependsOn: ['script_generation'],
      maxRetries: 2,
      estimatedDurationSec: 10,
      optional: false,
    },
    {
      id: 'image_generation',
      agentId: AgentId.IMAGE,
      name: 'Image Generation',
      description: 'Generate AI images for each scene',
      dependsOn: ['prompt_generation'],
      maxRetries: 3,
      estimatedDurationSec: 60,
      optional: false,
    },
    {
      id: 'voice_generation',
      agentId: AgentId.VOICE,
      name: 'Voiceover Generation',
      description: 'Generate AI voiceover narration',
      dependsOn: ['script_generation'], // Can run in parallel with image gen
      maxRetries: 2,
      estimatedDurationSec: 30,
      optional: false,
    },
    {
      id: 'video_composition',
      agentId: AgentId.EDITOR,
      name: 'Video Composition',
      description: 'Compose final video with images, voiceover, subtitles, and music',
      dependsOn: ['image_generation', 'voice_generation'], // Needs both
      maxRetries: 2,
      estimatedDurationSec: 90,
      optional: false,
    },
    {
      id: 'thumbnail_generation',
      agentId: AgentId.THUMBNAIL,
      name: 'Thumbnail Generation',
      description: 'Generate high-CTR thumbnail',
      dependsOn: ['script_generation'], // Can run in parallel with video composition
      maxRetries: 2,
      estimatedDurationSec: 20,
      optional: true,
    },
    {
      id: 'seo_generation',
      agentId: AgentId.SEO,
      name: 'SEO Optimization',
      description: 'Generate titles, descriptions, tags, and hashtags',
      dependsOn: ['script_generation'],
      maxRetries: 2,
      estimatedDurationSec: 10,
      optional: true,
    },
  ],
};

/**
 * Script-only pipeline — just generate a script.
 */
export const SCRIPT_ONLY_PIPELINE: PipelineTemplate = {
  id: 'script_only',
  name: 'Script Generation',
  description: 'Generate a script for a given topic',
  steps: [
    {
      id: 'script_generation',
      agentId: AgentId.SCRIPT,
      name: 'Script Writing',
      description: 'Generate a professional script',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 15,
      optional: false,
    },
  ],
};

/**
 * Thumbnail-only pipeline.
 */
export const THUMBNAIL_ONLY_PIPELINE: PipelineTemplate = {
  id: 'thumbnail_only',
  name: 'Thumbnail Generation',
  description: 'Generate a YouTube thumbnail',
  steps: [
    {
      id: 'thumbnail_generation',
      agentId: AgentId.THUMBNAIL,
      name: 'Thumbnail Generation',
      description: 'Generate high-CTR thumbnail',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 20,
      optional: false,
    },
  ],
};

/**
 * Research-only pipeline.
 */
export const RESEARCH_ONLY_PIPELINE: PipelineTemplate = {
  id: 'research_only',
  name: 'Trend Research',
  description: 'Research trending topics and content ideas',
  steps: [
    {
      id: 'trend_research',
      agentId: AgentId.TREND,
      name: 'Trend Research',
      description: 'Research trending topics',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 10,
      optional: false,
    },
  ],
};

/**
 * Voiceover-only pipeline.
 */
export const VOICEOVER_ONLY_PIPELINE: PipelineTemplate = {
  id: 'voiceover_only',
  name: 'Voiceover Generation',
  description: 'Generate AI voiceover from text',
  steps: [
    {
      id: 'voice_generation',
      agentId: AgentId.VOICE,
      name: 'Voiceover Generation',
      description: 'Generate voiceover narration',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 30,
      optional: false,
    },
  ],
};

/**
 * SEO-only pipeline.
 */
export const SEO_ONLY_PIPELINE: PipelineTemplate = {
  id: 'seo_only',
  name: 'SEO Generation',
  description: 'Generate SEO-optimized titles, descriptions, and tags',
  steps: [
    {
      id: 'seo_generation',
      agentId: AgentId.SEO,
      name: 'SEO Generation',
      description: 'Generate SEO metadata',
      dependsOn: [],
      maxRetries: 2,
      estimatedDurationSec: 10,
      optional: false,
    },
  ],
};

/**
 * All available pipeline templates.
 */
export const PIPELINE_TEMPLATES: Record<string, PipelineTemplate> = {
  full_video: FULL_VIDEO_PIPELINE,
  script_only: SCRIPT_ONLY_PIPELINE,
  thumbnail_only: THUMBNAIL_ONLY_PIPELINE,
  research_only: RESEARCH_ONLY_PIPELINE,
  voiceover_only: VOICEOVER_ONLY_PIPELINE,
  seo_only: SEO_ONLY_PIPELINE,
};

/**
 * Get a pipeline template by ID.
 */
export function getPipelineTemplate(templateId: string): PipelineTemplate | undefined {
  return PIPELINE_TEMPLATES[templateId];
}
