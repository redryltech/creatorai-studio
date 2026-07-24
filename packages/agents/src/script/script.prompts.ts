// ============================================================
// CreatorAI Studio — Script Agent Prompt Templates
// ============================================================
// These are registered in the PromptManager at bootstrap.
// Agents never hardcode prompts — they reference template IDs.
//
// Template variable convention:
//   {{topic}}     — The content topic
//   {{platform}}  — Target platform (YouTube Shorts, Instagram, etc.)
//   {{duration}}  — Target duration in seconds
//   {{style}}     — Script style (hook_story_cta, educational, etc.)
//   {{tone}}      — Tone (professional, casual, dramatic, etc.)
//   {{language}}  — Content language
//   {{sceneCount}} — Number of scenes to generate
//   {{keyPoints}} — Key points to cover (optional)
//   {{brandVoice}} — Brand voice description (optional)
// ============================================================

import type { PromptTemplate } from '@creatorai/shared';

export const SCRIPT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'script.short_form',
    name: 'Short-Form Video Script',
    version: 1,
    category: 'script',
    systemPrompt: `You are an elite viral content strategist and scriptwriter who has written scripts for channels with 10M+ subscribers. You specialize in creating short-form content that hooks viewers in the first 2 seconds and maintains attention throughout.

Your scripts are:
- Psychologically optimized for engagement
- Structured with pattern interrupts every 3-5 seconds
- Written in conversational, punchy language
- Designed to maximize watch-through rate and shares

You ALWAYS respond with valid JSON matching the exact schema requested. No markdown, no explanations outside the JSON.`,

    userPromptTemplate: `Write a {{style}} script about "{{topic}}" for {{platform}}.

Target duration: {{duration}} seconds
Tone: {{tone}}
Language: {{language}}
{{keyPoints}}
{{brandVoice}}

Requirements:
1. The hook (first scene) MUST create immediate curiosity or shock — the viewer decides to stay or leave in 1.5 seconds
2. Each scene should have a clear visual that can be represented as a single AI-generated image or short video clip
3. Include a strong, specific CTA at the end
4. Every scene narration should be concise — short sentences, active voice
5. Visual descriptions must be detailed enough to generate AI images (describe setting, lighting, mood, camera angle)
6. Target {{sceneCount}} scenes total

Respond with this exact JSON structure:
{
  "fullText": "The complete narration text without scene breaks",
  "scenes": [
    {
      "id": "scene-1",
      "order": 1,
      "type": "hook|intro|body|climax|cta|outro",
      "narration": "Exact text to be spoken for this scene",
      "visualDescription": "Detailed description of what should be shown visually during this narration",
      "duration": 5,
      "notes": "Director notes — mood, pacing, emphasis",
      "transition": "cut|crossfade|zoom_in|zoom_out|fade_black"
    }
  ],
  "metadata": {
    "wordCount": 150,
    "estimatedDuration": 60,
    "readabilityScore": 85,
    "hookStrength": 92,
    "ctaStrength": 88,
    "emotionalArc": ["curiosity", "surprise", "determination", "action"]
  }
}`,
    variables: ['topic', 'platform', 'duration', 'style', 'tone', 'language', 'sceneCount', 'keyPoints', 'brandVoice'],
    model: null,
    temperature: 0.8,
    maxTokens: 4096,
    responseFormat: 'json',
    metadata: {
      description: 'Generates a complete short-form video script with scene breakdown',
      author: 'CreatorAI Studio',
      lastUpdated: new Date(),
      averageTokens: 2500,
      averageCostUsd: null,
    },
  },

  {
    id: 'script.long_form',
    name: 'Long-Form Video Script',
    version: 1,
    category: 'script',
    systemPrompt: `You are an expert YouTube scriptwriter and storytelling strategist. You craft long-form content that maintains viewer retention above 60% average watch time.

Your strengths:
- Building narrative tension that keeps viewers watching
- Strategic placement of open loops and payoff moments
- Seamless integration of B-roll scene descriptions
- Writing conversational narration that sounds natural when read aloud

You ALWAYS respond with valid JSON. No markdown wrapping.`,

    userPromptTemplate: `Write a {{style}} long-form script about "{{topic}}" for {{platform}}.

Target duration: {{duration}} seconds
Tone: {{tone}}
Language: {{language}}
{{keyPoints}}
{{brandVoice}}

Requirements:
1. Open with a hook that creates an unanswered question
2. Structure with a 3-act narrative: Setup → Confrontation → Resolution
3. Include pattern interrupts every 30-45 seconds (new visual, shift in tone, question)
4. Each scene should last 15-30 seconds
5. Visual descriptions must be detailed enough for AI image generation
6. Include mid-roll retention hooks ("but what happened next is even more shocking...")
7. End with a CTA and a teaser for the next video
8. Target {{sceneCount}} scenes total

Respond with the same JSON structure as a short-form script (with fullText, scenes array, and metadata).`,
    variables: ['topic', 'platform', 'duration', 'style', 'tone', 'language', 'sceneCount', 'keyPoints', 'brandVoice'],
    model: null,
    temperature: 0.7,
    maxTokens: 8192,
    responseFormat: 'json',
    metadata: {
      description: 'Generates a complete long-form video script with detailed scene breakdown',
      author: 'CreatorAI Studio',
      lastUpdated: new Date(),
      averageTokens: 5000,
      averageCostUsd: null,
    },
  },
];
