import { describe, it, expect } from 'vitest';
import { chunk, formatBytes, formatDuration, wordCount, estimateSpeakingDuration, truncate, slugify } from '../utils/helpers';

describe('chunk', () => {
  it('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('handles empty array', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('handles chunk size larger than array', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });
});

describe('formatBytes', () => {
  it('formats zero', () => { expect(formatBytes(0)).toBe('0 Bytes'); });
  it('formats KB', () => { expect(formatBytes(1536)).toBe('1.5 KB'); });
  it('formats MB', () => { expect(formatBytes(1048576)).toBe('1 MB'); });
  it('formats GB', () => { expect(formatBytes(1073741824)).toBe('1 GB'); });
});

describe('formatDuration', () => {
  it('formats seconds', () => { expect(formatDuration(45)).toBe('45s'); });
  it('formats minutes', () => { expect(formatDuration(150)).toBe('2m 30s'); });
  it('formats hours', () => { expect(formatDuration(3700)).toBe('1h 1m'); });
});

describe('wordCount', () => {
  it('counts words', () => { expect(wordCount('hello world foo')).toBe(3); });
  it('handles empty', () => { expect(wordCount('')).toBe(0); });
  it('handles extra whitespace', () => { expect(wordCount('  a  b  c  ')).toBe(3); });
});

describe('estimateSpeakingDuration', () => {
  it('estimates 150 wpm by default', () => {
    // 150 words should take 60 seconds
    const text = Array(150).fill('word').join(' ');
    expect(Math.round(estimateSpeakingDuration(text))).toBe(60);
  });
});

describe('truncate', () => {
  it('does not truncate short text', () => { expect(truncate('hello', 10)).toBe('hello'); });
  it('truncates long text with ellipsis', () => { expect(truncate('hello world this is long', 15)).toBe('hello world ...');});
});

describe('slugify', () => {
  it('converts to URL-safe slug', () => { expect(slugify('Hello World!')).toBe('hello-world'); });
  it('handles special characters', () => { expect(slugify('Café & Résumé')).toBe('caf-rsum'); });
});
