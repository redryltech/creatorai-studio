/**
 * Prefixes for different entity types.
 * Using prefixes makes IDs self-documenting in logs, URLs, and debugging.
 */
export declare const ID_PREFIXES: {
    readonly project: "proj";
    readonly pipeline: "pipe";
    readonly scene: "scn";
    readonly asset: "ast";
    readonly output: "out";
    readonly conversation: "conv";
    readonly message: "msg";
    readonly schedule: "sched";
    readonly user: "usr";
    readonly step: "step";
    readonly apiKey: "key";
};
export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];
/**
 * Generate a unique, prefixed, time-sortable ID.
 *
 * Properties:
 * - Prefixed: Self-documenting (proj_, pipe_, scn_, etc.)
 * - Time-sortable: Lexicographic sort = chronological sort
 * - Collision-resistant: 6 random bytes per ID
 * - URL-safe: Only alphanumeric + underscore
 *
 * @param prefix - Entity type prefix from ID_PREFIXES
 * @returns Unique ID string
 */
export declare function generateId(prefix: IdPrefix): string;
/**
 * Extract the timestamp from a generated ID.
 * Useful for debugging and auditing.
 */
export declare function extractTimestamp(id: string): Date | null;
/**
 * Validate that an ID has the expected prefix.
 */
export declare function validateIdPrefix(id: string, expectedPrefix: IdPrefix): boolean;
//# sourceMappingURL=id-generator.d.ts.map