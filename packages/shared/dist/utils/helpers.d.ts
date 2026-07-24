/**
 * Sleep for a given number of milliseconds.
 * Used in retry logic and rate limiting.
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelayMs - Base delay between retries (doubles each time)
 * @param shouldRetry - Optional predicate to decide if error is retryable
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number, shouldRetry?: (error: Error, attempt: number) => boolean): Promise<T>;
/**
 * Chunk an array into smaller arrays of a given size.
 * Used for batch processing (e.g., generating images for multiple scenes).
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Format bytes into human-readable string.
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format seconds into human-readable duration.
 */
export declare function formatDuration(seconds: number): string;
/**
 * Estimate word count from text.
 */
export declare function wordCount(text: string): number;
/**
 * Estimate speaking duration from text (in seconds).
 * Average speaking rate: ~150 words per minute.
 */
export declare function estimateSpeakingDuration(text: string, wordsPerMinute?: number): number;
/**
 * Truncate text to a maximum length with ellipsis.
 */
export declare function truncate(text: string, maxLength: number): string;
/**
 * Generate a slug from a string (for URLs).
 */
export declare function slugify(text: string): string;
/**
 * Deep clone a plain object (no functions, dates, etc.).
 * For complex objects, use structuredClone().
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Pick specific keys from an object.
 */
export declare function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specific keys from an object.
 */
export declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Create a deferred promise — useful for creating externally resolvable promises.
 */
export declare function createDeferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
};
//# sourceMappingURL=helpers.d.ts.map