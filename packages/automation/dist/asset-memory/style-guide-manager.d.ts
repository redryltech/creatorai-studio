import type { StyleGuide } from './asset.types';
export declare class StyleGuideManager {
    private guides;
    save(guide: StyleGuide): void;
    get(id: string): StyleGuide | undefined;
    list(): StyleGuide[];
    get size(): number;
}
//# sourceMappingURL=style-guide-manager.d.ts.map