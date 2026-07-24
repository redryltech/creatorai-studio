import type { HashtagPackage } from './creator.types';
export class HashtagEngine {
  static generate(topic: string, category: string, keywords: string[]): HashtagPackage {
    const base = topic.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2).map(w => `#${w}`);
    const catTag = `#${category}`;
    const kwTags = keywords.slice(0, 8).map(k => `#${k.replace(/\s+/g, '')}`);
    const ytTags = [...new Set([...base, catTag, ...kwTags, '#Shorts', '#YouTubeShorts', '#Viral'])].slice(0, 15).map((t, i) => ({ tag: t, relevance: Math.max(0.3, 1 - i * 0.05) }));
    const igTags = [...new Set([...base, catTag, ...kwTags, '#Reels', '#Explore', '#Trending', '#InstaReels', '#ViralReels'])].slice(0, 30).map((t, i) => ({ tag: t, relevance: Math.max(0.2, 1 - i * 0.03) }));
    const ttTags = [...new Set([...base, catTag, ...kwTags, '#fyp', '#foryou', '#viral', '#trending', '#tiktok'])].slice(0, 20).map((t, i) => ({ tag: t, relevance: Math.max(0.3, 1 - i * 0.04) }));
    return { youtube: ytTags, instagram: igTags, tiktok: ttTags, totalCount: ytTags.length + igTags.length + ttTags.length };
  }
}
