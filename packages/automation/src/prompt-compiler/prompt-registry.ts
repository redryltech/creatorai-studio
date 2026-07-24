import { Logger } from '@creatorai/agents';
const log = Logger.for('PromptRegistry');
export interface IPromptStrategy { readonly strategyId: string; canHandle(category: string): boolean; }
export class PromptRegistry {
  private static instance: PromptRegistry | null = null;
  private strategies: Map<string, IPromptStrategy> = new Map();
  private constructor() {}
  static getInstance(): PromptRegistry { if (!PromptRegistry.instance) PromptRegistry.instance = new PromptRegistry(); return PromptRegistry.instance; }
  static resetInstance(): void { PromptRegistry.instance = null; }
  register(s: IPromptStrategy): void { this.strategies.set(s.strategyId, s); }
  get size(): number { return this.strategies.size; }
}
