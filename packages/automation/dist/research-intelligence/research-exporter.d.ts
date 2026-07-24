import type { ResearchPackage, ResearchExportFormats } from './research.types';
/** Exports research packages in multiple formats. */
export declare class ResearchExporter {
    /** Export to all supported formats. */
    static export(pkg: ResearchPackage): ResearchExportFormats;
    /** Export research as a Markdown document. */
    private static toMarkdown;
}
//# sourceMappingURL=research-exporter.d.ts.map