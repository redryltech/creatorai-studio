// ============================================================
// CreatorAI Studio — Feature Flags & Configuration
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('FeatureFlags');
export class FeatureFlagService {
    static instance = null;
    flags = new Map();
    constructor() {
        // Default flags
        this.register({ name: 'voice_cloning', description: 'AI voice cloning', enabled: true, allowedPlans: ['pro', 'business', 'enterprise'] });
        this.register({ name: 'ai_memory', description: 'Persistent AI memory', enabled: true, allowedPlans: ['pro', 'business', 'enterprise'] });
        this.register({ name: 'team_collaboration', description: 'Team features', enabled: true, allowedPlans: ['business', 'enterprise'] });
        this.register({ name: 'api_access', description: 'Public API', enabled: true, allowedPlans: ['business', 'enterprise'] });
        this.register({ name: 'white_label', description: 'White label branding', enabled: true, allowedPlans: ['business', 'enterprise'] });
        this.register({ name: 'custom_models', description: 'Custom AI models', enabled: true, allowedPlans: ['enterprise'] });
        this.register({ name: 'sso', description: 'Single sign-on', enabled: true, allowedPlans: ['enterprise'] });
        this.register({ name: '4k_render', description: '4K video rendering', enabled: true, allowedPlans: ['business', 'enterprise'] });
        this.register({ name: 'marketplace', description: 'Marketplace access', enabled: true, allowedPlans: ['starter', 'pro', 'business', 'enterprise'] });
        this.register({ name: 'trend_monitor', description: 'Real-time trend monitoring', enabled: true, allowedPlans: ['pro', 'business', 'enterprise'] });
    }
    static getInstance() { if (!FeatureFlagService.instance)
        FeatureFlagService.instance = new FeatureFlagService(); return FeatureFlagService.instance; }
    static resetInstance() { FeatureFlagService.instance = null; }
    register(params) {
        this.flags.set(params.name, { id: params.name, name: params.name, description: params.description, enabled: params.enabled, allowedPlans: params.allowedPlans, allowedOrganizations: [], percentage: 100, createdAt: new Date() });
    }
    /** Check if a feature is enabled for a given plan. */
    isEnabled(featureName, plan, organizationId) {
        const flag = this.flags.get(featureName);
        if (!flag || !flag.enabled)
            return false;
        if (flag.allowedOrganizations.length > 0 && organizationId && !flag.allowedOrganizations.includes(organizationId))
            return false;
        return flag.allowedPlans.includes(plan);
    }
    /** Get all flags. */
    getAll() { return Array.from(this.flags.values()); }
    /** Update a flag. */
    update(name, updates) {
        const flag = this.flags.get(name);
        if (flag) {
            Object.assign(flag, updates);
            log.info('Feature flag updated', { name, ...updates });
        }
    }
}
//# sourceMappingURL=feature-flags.js.map