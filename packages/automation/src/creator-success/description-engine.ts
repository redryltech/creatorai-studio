import type { DescriptionPackage } from './creator.types';
export class DescriptionEngine {
  static generate(topic: string, narration: string, keywords: string[], hashtags: string[]): DescriptionPackage {
    const ht = hashtags.slice(0, 10).join(' ');
    const kw = keywords.slice(0, 5).join(', ');
    const short = narration.slice(0, 100);
    return {
      youtube: `${short}...\n\n🔑 Keywords: ${kw}\n\n📌 In this video:\n- Complete overview of ${topic}\n- Features, performance & honest opinion\n- Why creators and enthusiasts love it\n\n🔔 Subscribe for more content!\n\n${ht}\n\n⏰ Timestamps:\n0:00 - Hook\n0:05 - Overview\n0:15 - Features\n0:30 - Performance\n0:45 - Conclusion`,
      instagram: `${short}... 🔥\n\nDouble tap if you agree! ❤️\n\n${ht}\n\n#Shorts #Viral #Trending`,
      tiktok: `${short} 🚀\n\n${ht}\n\n#fyp #foryou #viral`,
      facebook: `${short}...\n\nWatch the full breakdown of ${topic}!\n\n${ht}`,
      linkedin: `${topic}\n\n${short}...\n\nKey takeaways:\n• ${keywords[0] ?? topic}\n• ${keywords[1] ?? 'Expert analysis'}\n• ${keywords[2] ?? 'Industry insights'}`,
      x: `${short.slice(0, 200)}... 🧵\n\n${hashtags.slice(0, 5).join(' ')}`,
      ctaSuggestions: ['Subscribe for more!', 'Drop a 🔥 in the comments!', 'Share with someone who needs this!', 'Save this for later!', 'Follow for daily content!'],
      linksSection: `📱 Follow us:\n• YouTube: [channel]\n• Instagram: [handle]\n• Twitter/X: [handle]`,
      timestampSuggestions: ['0:00 - Hook', '0:05 - Introduction', '0:15 - Main Content', '0:30 - Key Features', '0:45 - Conclusion & CTA'],
    };
  }
}
