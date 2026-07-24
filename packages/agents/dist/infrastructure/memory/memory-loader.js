// ============================================================
// CreatorAI Studio — Memory Loader
// ============================================================
// Assembles merged memory context from workspace memory,
// project memory, and brand profile. Injected into agent
// system prompts before every execution.
//
// Usage by agents:
//   const memory = await MemoryLoader.load(workspaceId, projectId);
//   const systemPrompt = basePrompt + memory.systemPromptInjection;
//
// The MemoryLoader is stateless — it reads from repositories
// on every call. Caching can be added later if needed.
// ============================================================
import { Logger } from '../logger';
const log = Logger.for('MemoryLoader');
export class MemoryLoader {
    static dataSource = null;
    /**
     * Set the data source (called during bootstrap).
     * This injects the repository layer without the agents package
     * depending on the database package directly.
     */
    static setDataSource(ds) {
        MemoryLoader.dataSource = ds;
    }
    /**
     * Load and merge memory context for an agent execution.
     *
     * @param workspaceId — The workspace owning the project
     * @param projectId — Optional project for project-level overrides
     * @param brandProfileId — Optional specific brand profile
     */
    static async load(workspaceId, projectId, brandProfileId) {
        if (!MemoryLoader.dataSource) {
            log.debug('No memory data source configured, returning empty context');
            return this.emptyContext();
        }
        try {
            // Load all three layers in parallel
            const [workspaceMemory, projectMemory, brandProfile] = await Promise.all([
                MemoryLoader.dataSource.getWorkspaceMemory(workspaceId),
                projectId ? MemoryLoader.dataSource.getProjectMemory(workspaceId, projectId) : null,
                brandProfileId
                    ? MemoryLoader.dataSource.getBrandById(brandProfileId)
                    : MemoryLoader.dataSource.getDefaultBrand(workspaceId),
            ]);
            // Build system prompt injection
            const systemPromptInjection = this.buildSystemPromptInjection(workspaceMemory, projectMemory, brandProfile);
            // Merge negative prompts
            const negativePromptAdditions = [
                ...(workspaceMemory?.globalNegativePrompts ?? []),
                ...(projectMemory?.globalNegativePrompts ?? []),
                ...(brandProfile?.contentRules.mustAvoid ?? []),
            ];
            // Merge CTA templates
            const ctaTemplates = [
                ...(workspaceMemory?.contentStrategy.callToActions ?? []),
                ...(brandProfile?.contentRules.ctaTemplates ?? []),
            ];
            log.debug('Memory context loaded', {
                workspaceId,
                projectId,
                hasWorkspaceMemory: !!workspaceMemory,
                hasProjectMemory: !!projectMemory,
                hasBrandProfile: !!brandProfile,
                injectionLength: systemPromptInjection.length,
            });
            return {
                workspaceMemory,
                projectMemory,
                brandProfile,
                systemPromptInjection,
                negativePromptAdditions,
                ctaTemplates,
            };
        }
        catch (error) {
            log.error('Failed to load memory context, using empty', {}, error);
            return this.emptyContext();
        }
    }
    /**
     * Build the system prompt injection text from memory layers.
     * This is appended to every agent's system prompt.
     */
    static buildSystemPromptInjection(workspace, project, brand) {
        const sections = [];
        // Custom instructions (highest priority — project overrides workspace)
        const customInstructions = project?.customInstructions || workspace?.customInstructions;
        if (customInstructions) {
            sections.push(`## Creator Instructions\n${customInstructions}`);
        }
        // Brand identity
        if (brand) {
            const b = brand.identity;
            sections.push([
                `## Brand: ${b.brandName}`,
                b.tagline && `Tagline: ${b.tagline}`,
                b.mission && `Mission: ${b.mission}`,
                b.industry && `Industry: ${b.industry}`,
                brand.voiceTone.tone && `Tone: ${brand.voiceTone.tone}`,
                brand.voiceTone.personality.length > 0 && `Personality: ${brand.voiceTone.personality.join(', ')}`,
                brand.voiceTone.languageStyle && `Language style: ${brand.voiceTone.languageStyle}`,
            ].filter(Boolean).join('\n'));
        }
        // Writing style
        const style = project?.writingStyle ?? workspace?.writingStyle;
        if (style?.persona) {
            sections.push(`## Persona\n${style.persona}`);
        }
        if (style?.samplePhrases && style.samplePhrases.length > 0) {
            sections.push(`## Example Phrases\n${style.samplePhrases.map((p) => `- "${p}"`).join('\n')}`);
        }
        // Audience
        const audience = project?.audience ?? workspace?.audience;
        if (audience && audience.interests.length > 0) {
            sections.push([
                `## Target Audience`,
                `Age: ${audience.primaryAge}`,
                `Interests: ${audience.interests.join(', ')}`,
                audience.painPoints.length > 0 && `Pain points: ${audience.painPoints.join(', ')}`,
            ].filter(Boolean).join('\n'));
        }
        // Facts to remember
        const facts = [...(workspace?.facts ?? []), ...(project?.facts ?? [])];
        if (facts.length > 0) {
            sections.push(`## Key Facts\n${facts.map((f) => `- ${f}`).join('\n')}`);
        }
        // Restrictions
        const restrictions = [...(workspace?.restrictions ?? []), ...(project?.restrictions ?? [])];
        if (brand?.contentRules.forbiddenWords.length) {
            restrictions.push(`Never use: ${brand.contentRules.forbiddenWords.join(', ')}`);
        }
        if (brand?.contentRules.mustAvoid.length) {
            restrictions.push(...brand.contentRules.mustAvoid);
        }
        if (restrictions.length > 0) {
            sections.push(`## Restrictions\n${restrictions.map((r) => `- ${r}`).join('\n')}`);
        }
        // Content pillars
        const pillars = workspace?.contentStrategy.contentPillars ?? [];
        if (pillars.length > 0) {
            sections.push(`## Content Pillars\n${pillars.map((p) => `- ${p}`).join('\n')}`);
        }
        if (sections.length === 0)
            return '';
        return '\n\n---\n\n' + sections.join('\n\n') + '\n\n---';
    }
    static emptyContext() {
        return {
            workspaceMemory: null,
            projectMemory: null,
            brandProfile: null,
            systemPromptInjection: '',
            negativePromptAdditions: [],
            ctaTemplates: [],
        };
    }
}
//# sourceMappingURL=memory-loader.js.map