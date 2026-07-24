// ============================================================
// CreatorAI Studio — ID Generator Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateId, extractTimestamp, validateIdPrefix, ID_PREFIXES } from '../utils/id-generator';

describe('generateId', () => {
  it('generates IDs with the correct prefix', () => {
    const id = generateId(ID_PREFIXES.project);
    expect(id).toMatch(/^proj_/);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId(ID_PREFIXES.asset)));
    expect(ids.size).toBe(1000);
  });

  it('generates IDs with three parts: prefix_timestamp_random', () => {
    const id = generateId(ID_PREFIXES.pipeline);
    const parts = id.split('_');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('pipe');
  });

  it('produces IDs that are sortable chronologically', () => {
    const id1 = generateId(ID_PREFIXES.step);
    const id2 = generateId(ID_PREFIXES.step);
    // Lexicographic sort should equal chronological sort
    expect(id1 < id2 || id1 === id2).toBe(true);
  });
});

describe('extractTimestamp', () => {
  it('extracts the creation timestamp from an ID', () => {
    const before = Date.now();
    const id = generateId(ID_PREFIXES.project);
    const after = Date.now();

    const ts = extractTimestamp(id);
    expect(ts).not.toBeNull();
    expect(ts!.getTime()).toBeGreaterThanOrEqual(before);
    expect(ts!.getTime()).toBeLessThanOrEqual(after);
  });

  it('returns null for invalid IDs', () => {
    expect(extractTimestamp('')).toBeNull();
    expect(extractTimestamp('invalid')).toBeNull();
  });
});

describe('validateIdPrefix', () => {
  it('validates correct prefix', () => {
    const id = generateId(ID_PREFIXES.project);
    expect(validateIdPrefix(id, ID_PREFIXES.project)).toBe(true);
  });

  it('rejects wrong prefix', () => {
    const id = generateId(ID_PREFIXES.project);
    expect(validateIdPrefix(id, ID_PREFIXES.asset)).toBe(false);
  });
});
