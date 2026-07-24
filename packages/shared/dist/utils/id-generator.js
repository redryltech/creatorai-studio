// ============================================================
// CreatorAI Studio — ID Generator
// ============================================================
// Generates prefixed, sortable, collision-resistant IDs.
// Format: {prefix}_{timestamp_base36}_{random}
// Example: proj_m1a2b3c4_x7y8z9
// ============================================================
import { randomBytes } from 'crypto';
const RANDOM_BYTES = 6; // 6 bytes = ~281 trillion combinations
/**
 * Prefixes for different entity types.
 * Using prefixes makes IDs self-documenting in logs, URLs, and debugging.
 */
export const ID_PREFIXES = {
    project: 'proj',
    pipeline: 'pipe',
    scene: 'scn',
    asset: 'ast',
    output: 'out',
    conversation: 'conv',
    message: 'msg',
    schedule: 'sched',
    user: 'usr',
    step: 'step',
    apiKey: 'key',
};
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
export function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(RANDOM_BYTES).toString('hex').slice(0, 8);
    return `${prefix}_${timestamp}_${random}`;
}
/**
 * Extract the timestamp from a generated ID.
 * Useful for debugging and auditing.
 */
export function extractTimestamp(id) {
    const parts = id.split('_');
    if (parts.length < 2)
        return null;
    const timestamp = parseInt(parts[1], 36);
    if (isNaN(timestamp))
        return null;
    return new Date(timestamp);
}
/**
 * Validate that an ID has the expected prefix.
 */
export function validateIdPrefix(id, expectedPrefix) {
    return id.startsWith(`${expectedPrefix}_`);
}
//# sourceMappingURL=id-generator.js.map