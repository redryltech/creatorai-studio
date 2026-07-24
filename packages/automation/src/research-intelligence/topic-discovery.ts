// ============================================================
// CreatorAI Studio — Topic Discovery Engine
// ============================================================

import { Logger } from '@creatorai/agents';
import type { TopicDiscovery, TopicIdea, ContentCategory } from './research.types';

const log = Logger.for('TopicDiscovery');

const TOPIC_TEMPLATES: Record<string, Array<{ template: string; type: TopicIdea['type'] }>> = {
  automotive: [
    { template: '{topic} vs {competitor} — Which One Wins?', type: 'related' },
    { template: '{topic} — Top Speed Test', type: 'subtopic' },
    { template: 'Is {topic} Worth the Price?', type: 'faq' },
    { template: '{topic} After 1 Year — Long Term Review', type: 'future' },
    { template: '{topic} Modifications That Change Everything', type: 'related' },
    { template: '{topic} Common Problems & Solutions', type: 'faq' },
    { template: 'Best Accessories for {topic}', type: 'subtopic' },
    { template: '{topic} — Beginner\'s Complete Guide', type: 'evergreen' },
  ],
  technology: [
    { template: '{topic} — Complete Setup Guide', type: 'subtopic' },
    { template: '{topic} vs Alternatives — Honest Comparison', type: 'related' },
    { template: 'Is {topic} Worth It in 2024?', type: 'faq' },
    { template: 'Hidden Features of {topic}', type: 'trending' },
    { template: '{topic} Tips Nobody Tells You', type: 'related' },
    { template: 'Future of {topic} — What\'s Coming Next', type: 'future' },
  ],
  motivational: [
    { template: 'Why {topic} Changes Your Life', type: 'related' },
    { template: '{topic} — The Science Behind It', type: 'subtopic' },
    { template: 'How to Apply {topic} Daily', type: 'faq' },
    { template: '{topic} for Beginners', type: 'evergreen' },
    { template: 'Famous People Who Mastered {topic}', type: 'related' },
    { template: '{topic} Challenge — 30 Days', type: 'trending' },
  ],
};

const DEFAULT_TEMPLATES: Array<{ template: string; type: TopicIdea['type'] }> = [
  { template: 'Complete Guide to {topic}', type: 'evergreen' },
  { template: '{topic} — Top 5 Facts', type: 'related' },
  { template: 'Why {topic} Matters', type: 'subtopic' },
  { template: '{topic} FAQ — Everything Answered', type: 'faq' },
  { template: 'Future of {topic}', type: 'future' },
  { template: '{topic} Trending Now', type: 'trending' },
];

export class TopicDiscoveryEngine {
  static discover(topic: string, category: ContentCategory): TopicDiscovery {
    const templates = TOPIC_TEMPLATES[category] ?? DEFAULT_TEMPLATES;

    const ideas: TopicIdea[] = templates.map((t, i) => ({
      title: t.template.replace(/{topic}/g, topic),
      angle: `${t.type} content about ${topic}`,
      estimatedInterest: Math.max(40, 90 - i * 7),
      competition: (i < 2 ? 'high' : i < 5 ? 'medium' : 'low') as TopicIdea['competition'],
      type: t.type,
    }));

    const relatedTopics = ideas.filter((i) => i.type === 'related');
    const subtopics = ideas.filter((i) => i.type === 'subtopic');
    const faqs = ideas.filter((i) => i.type === 'faq');
    const futureIdeas = ideas.filter((i) => i.type === 'future' || i.type === 'trending');

    const contentCalendarSuggestions = [
      `Week 1: ${relatedTopics[0]?.title ?? topic + ' Introduction'}`,
      `Week 2: ${subtopics[0]?.title ?? topic + ' Deep Dive'}`,
      `Week 3: ${faqs[0]?.title ?? topic + ' FAQ'}`,
      `Week 4: ${futureIdeas[0]?.title ?? topic + ' What\'s Next'}`,
    ];

    log.info('Topic discovery complete', { topic: topic.slice(0, 40), ideas: ideas.length });

    return { relatedTopics, subtopics, faqs, futureIdeas, contentCalendarSuggestions };
  }
}
