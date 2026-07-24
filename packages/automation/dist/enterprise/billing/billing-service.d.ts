import type { Subscription, Invoice, PlanTier } from '../types/enterprise.types';
export declare class BillingService {
    private static instance;
    private subscriptions;
    private invoices;
    private constructor();
    static getInstance(): BillingService;
    static resetInstance(): void;
    /** Create a subscription. In production: calls Stripe API. */
    createSubscription(params: {
        userId: string;
        organizationId: string;
        plan: PlanTier;
        trial?: boolean;
    }): Promise<Subscription>;
    /** Upgrade/downgrade plan. */
    changePlan(subscriptionId: string, newPlan: PlanTier): Promise<Subscription>;
    /** Cancel subscription. */
    cancelSubscription(subscriptionId: string): Promise<Subscription>;
    /** Get subscription for organization. */
    getByOrganization(organizationId: string): Subscription | undefined;
    /** Create an invoice. */
    createInvoice(userId: string, organizationId: string, amount: number, description: string): Invoice;
    /** Get invoices for organization. */
    getInvoices(organizationId: string): Invoice[];
    /** Get MRR (Monthly Recurring Revenue). */
    getMRR(): number;
}
//# sourceMappingURL=billing-service.d.ts.map