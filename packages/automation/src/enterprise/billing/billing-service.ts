// ============================================================
// CreatorAI Studio — Billing & Subscription Service
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { Subscription, Invoice, PlanTier, Organization } from '../types/enterprise.types';
import { PLAN_CATALOG } from '../types/enterprise.types';

const log = Logger.for('BillingService');

export class BillingService {
  private static instance: BillingService | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Invoice[] = [];

  private constructor() {}
  static getInstance(): BillingService { if (!BillingService.instance) BillingService.instance = new BillingService(); return BillingService.instance; }
  static resetInstance(): void { BillingService.instance = null; }

  /** Create a subscription. In production: calls Stripe API. */
  async createSubscription(params: { userId: string; organizationId: string; plan: PlanTier; trial?: boolean }): Promise<Subscription> {
    const now = new Date();
    const sub: Subscription = {
      id: generateId(ID_PREFIXES.step),
      userId: params.userId,
      organizationId: params.organizationId,
      plan: params.plan,
      status: params.trial ? 'trialing' : 'active',
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 86400000),
      trialEnd: params.trial ? new Date(now.getTime() + 14 * 86400000) : null,
      cancelledAt: null,
      createdAt: now,
    };

    this.subscriptions.set(sub.id, sub);
    log.info('Subscription created', { subId: sub.id, plan: params.plan, trial: !!params.trial });

    // Create initial invoice
    const planInfo = PLAN_CATALOG[params.plan];
    if (planInfo && planInfo.priceMonthlyUsd > 0 && !params.trial) {
      this.createInvoice(params.userId, params.organizationId, planInfo.priceMonthlyUsd, `${planInfo.name} plan - monthly`);
    }

    return sub;
  }

  /** Upgrade/downgrade plan. */
  async changePlan(subscriptionId: string, newPlan: PlanTier): Promise<Subscription> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');
    const oldPlan = sub.plan;
    sub.plan = newPlan;
    log.info('Plan changed', { subId: subscriptionId, from: oldPlan, to: newPlan });
    return sub;
  }

  /** Cancel subscription. */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    log.info('Subscription cancelled', { subId: subscriptionId });
    return sub;
  }

  /** Get subscription for organization. */
  getByOrganization(organizationId: string): Subscription | undefined {
    return Array.from(this.subscriptions.values()).find((s) => s.organizationId === organizationId && s.status !== 'cancelled');
  }

  /** Create an invoice. */
  createInvoice(userId: string, organizationId: string, amount: number, description: string): Invoice {
    const now = new Date();
    const invoice: Invoice = {
      id: generateId(ID_PREFIXES.step), userId, organizationId,
      stripeInvoiceId: null, amount, currency: 'usd',
      status: 'open',
      periodStart: now, periodEnd: new Date(now.getTime() + 30 * 86400000),
      lineItems: [{ description, amount, quantity: 1 }],
      pdfUrl: null, paidAt: null, createdAt: now,
    };
    this.invoices.push(invoice);
    return invoice;
  }

  /** Get invoices for organization. */
  getInvoices(organizationId: string): Invoice[] {
    return this.invoices.filter((i) => i.organizationId === organizationId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /** Get MRR (Monthly Recurring Revenue). */
  getMRR(): number {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + (PLAN_CATALOG[s.plan]?.priceMonthlyUsd ?? 0), 0);
  }
}
