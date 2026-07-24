import { AgentId } from '@creatorai/shared';
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
    optional: boolean;
}
/**
 * Convert a template step to a pipeline step (with default values).
 */
export declare function templateStepToPipelineStep(template: PipelineStepTemplate, input?: Record<string, unknown>): PipelineStep;
/**
 * Full video creation pipeline — the main workflow.
 * trend → script → prompt → [image + voice] → editor → [thumbnail + seo]
 */
export declare const FULL_VIDEO_PIPELINE: PipelineTemplate;
/**
 * Script-only pipeline — just generate a script.
 */
export declare const SCRIPT_ONLY_PIPELINE: PipelineTemplate;
/**
 * Thumbnail-only pipeline.
 */
export declare const THUMBNAIL_ONLY_PIPELINE: PipelineTemplate;
/**
 * Research-only pipeline.
 */
export declare const RESEARCH_ONLY_PIPELINE: PipelineTemplate;
/**
 * Voiceover-only pipeline.
 */
export declare const VOICEOVER_ONLY_PIPELINE: PipelineTemplate;
/**
 * SEO-only pipeline.
 */
export declare const SEO_ONLY_PIPELINE: PipelineTemplate;
/**
 * All available pipeline templates.
 */
export declare const PIPELINE_TEMPLATES: Record<string, PipelineTemplate>;
/**
 * Get a pipeline template by ID.
 */
export declare function getPipelineTemplate(templateId: string): PipelineTemplate | undefined;
//# sourceMappingURL=pipeline-templates.d.ts.map