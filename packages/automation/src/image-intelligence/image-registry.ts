import { Logger } from '@creatorai/agents';
const log = Logger.for('ImageRegistry');
export interface IImageStrategy { readonly strategyId: string; canHandle(style: string): boolean; }
export class ImageRegistry {
  private static instance: ImageRegistry | null = null;
  private strategies: Map<string, IImageStrategy> = new Map();
  private constructor() {}
  static getInstance(): ImageRegistry { if (!ImageRegistry.instance) ImageRegistry.instance = new ImageRegistry(); return ImageRegistry.instance; }
  static resetInstance(): void { ImageRegistry.instance = null; }
  register(s: IImageStrategy): void { this.strategies.set(s.strategyId, s); log.info('Image strategy registered', { id: s.strategyId }); }
  get size(): number { return this.strategies.size; }
}
