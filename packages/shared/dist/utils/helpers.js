// ============================================================
// CreatorAI Studio — Shared Utility Helpers
// ============================================================
/**
 * Sleep for a given number of milliseconds.
 * Used in retry logic and rate limiting.
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelayMs - Base delay between retries (doubles each time)
 * @param shouldRetry - Optional predicate to decide if error is retryable
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1000, shouldRetry = () => true) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
                throw lastError;
            }
            const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
            await sleep(delay);
        }
    }
    throw lastError;
}
/**
 * Chunk an array into smaller arrays of a given size.
 * Used for batch processing (e.g., generating images for multiple scenes).
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Format bytes into human-readable string.
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Format seconds into human-readable duration.
 */
export function formatDuration(seconds) {
    if (seconds < 60)
        return `${Math.round(seconds)}s`;
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
/**
 * Estimate word count from text.
 */
export function wordCount(text) {
    return text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
}
/**
 * Estimate speaking duration from text (in seconds).
 * Average speaking rate: ~150 words per minute.
 */
export function estimateSpeakingDuration(text, wordsPerMinute = 150) {
    const words = wordCount(text);
    return (words / wordsPerMinute) * 60;
}
/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
}
/**
 * Generate a slug from a string (for URLs).
 */
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100);
}
/**
 * Deep clone a plain object (no functions, dates, etc.).
 * For complex objects, use structuredClone().
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Pick specific keys from an object.
 */
export function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
/**
 * Omit specific keys from an object.
 */
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
/**
 * Create a deferred promise — useful for creating externally resolvable promises.
 */
export function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
}
//# sourceMappingURL=helpers.js.map