// ============================================================
// CreatorAI Studio — Feature Flags & Configuration
// ============================================================

import { Logger } from '@creatorai/agents';
import type { FeatureFlag, PlanTier } from '../types/enterprise.types';

const log = Logger.for('FeatureFlags');

export class FeatureFlagService {
  private static instance: FeatureFlagService | null = null;
  private flags: Map<string, FeatureFlag> = new Map();

  private constructor() {
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

  static getInstance(): FeatureFlagService { if (!FeatureFlagService.instance) FeatureFlagService.instance = new FeatureFlagService(); return FeatureFlagService.instance; }
  static resetInstance(): void { FeatureFlagService.instance = null; }

  private register(params: { name: string; description: string; enabled: boolean; allowedPlans: PlanTier[] }): void {
    this.flags.set(params.name, { id: params.name, name: params.name, description: params.description, enabled: params.enabled, allowedPlans: params.allowedPlans, allowedOrganizations: [], percentage: 100, createdAt: new Date() });
  }

  /** Check if a feature is enabled for a given plan. */
  isEnabled(featureName: string, plan: PlanTier, organizationId?: string): boolean {
    const flag = this.flags.get(featureName);
    if (!flag || !flag.enabled) return false;
    if (flag.allowedOrganizations.length > 0 && organizationId && !flag.allowedOrganizations.includes(organizationId)) return false;
    return flag.allowedPlans.includes(plan);
  }

  /** Get all flags. */
  getAll(): FeatureFlag[] { return Array.from(this.flags.values()); }

  /** Update a flag. */
  update(name: string, updates: Partial<Pick<FeatureFlag, 'enabled' | 'allowedPlans' | 'percentage'>>): void {
    const flag = this.flags.get(name);
    if (flag) { Object.assign(flag, updates); log.info('Feature flag updated', { name, ...updates }); }
  }
}
