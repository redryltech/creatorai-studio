import type { PromptTemplate, PromptTemplateCategory } from './asset.types';
export declare class PromptTemplateManager {
    private templates;
    save(tmpl: PromptTemplate): void;
    get(id: string): PromptTemplate | undefined;
    getByCategory(cat: PromptTemplateCategory): PromptTemplate[];
    list(): PromptTemplate[];
    /** Apply a template with variable substitution. */
    apply(id: string, vars: Record<string, string>): {
        image: string;
        video: string;
        negative: string;
    } | null;
    get size(): number;
}
//# sourceMappingURL=prompt-template-manager.d.ts.map