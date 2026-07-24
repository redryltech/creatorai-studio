// ============================================================
// CreatorAI Studio — Prompt Generator Agent Templates
// ============================================================

import type { PromptTemplate } from '@creatorai/shared';

export const PROMPT_GENERATOR_TEMPLATES: PromptTemplate[] = [
  {
    id: 'prompt.scene_to_image',
    name: 'Scene to Image Prompt',
    version: 1,
    category: 'prompt',
    systemPrompt: `You are an expert AI image prompt engineer. You specialize in crafting prompts for Flux, DALL-E, Midjourney, and Stable Diffusion that produce cinematic, visually stunning images.

Your prompts are:
- Extremely detailed and specific
- Include camera angle, lighting, color grading, and mood
- Maintain character consistency when given character descriptions
- Optimized for the specific AI model being used
- Include negative prompts to prevent common artifacts

You ALWAYS respond with valid JSON. No markdown, no explanations outside the JSON.`,

    userPromptTemplate: `Convert these video script scenes into optimized AI image generation prompts.

Art style: {{artStyle}}
Aspect ratio: {{aspectRatio}}
Target model: {{targetModel}}
Maintain character consistency: {{characterConsistency}}

{{characterDescriptions}}

Scenes:
{{scenes}}

For each scene, generate:
1. A detailed positive prompt (what to generate)
2. A negative prompt (what to avoid)
3. Visual metadata (character, environment, camera angle, lighting, mood, color palette)

Respond with this JSON:
{
  "scenePrompts": [
    {
      "sceneId": "scene-1",
      "imagePrompt": {
        "positive": "Detailed image generation prompt...",
        "negative": "blurry, low quality, deformed, text, watermark, signature",
        "width": 1080,
        "height": 1920,
        "guidanceScale": 7.5
      },
      "metadata": {
        "character": "Description of character in this scene",
        "environment": "Description of the environment/setting",
        "cameraAngle": "close-up | medium shot | wide shot | bird's eye | low angle",
        "lighting": "Description of lighting setup",
        "mood": "The emotional mood of the scene",
        "colorPalette": ["#hex1", "#hex2", "#hex3"]
      }
    }
  ]
}`,
    variables: ['artStyle', 'aspectRatio', 'targetModel', 'characterConsistency', 'characterDescriptions', 'scenes'],
    model: null,
    temperature: 0.6,
    maxTokens: 6144,
    responseFormat: 'json',
    metadata: {
      description: 'Converts script scenes into optimized AI image generation prompts',
      author: 'CreatorAI Studio',
      lastUpdated: new Date(),
      averageTokens: 3500,
      averageCostUsd: null,
    },
  },
];
