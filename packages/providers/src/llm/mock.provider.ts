// ============================================================
// CreatorAI Studio — Mock LLM Provider (Development Mode)
// ============================================================
// Returns realistic JSON responses without any API calls.
// Used when DEVELOPMENT_MODE=true and no LLM keys are set.
//
// Produces structurally valid output that matches what
// every agent expects, so the full pipeline can run end-to-end.
// ============================================================

import type {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
} from '../core/provider.interface';

export class MockLLMProvider implements ILLMProvider {
  readonly id = 'mock_llm';
  readonly name = 'Mock LLM (Dev Mode)';
  readonly version = '1.0.0';

  async isAvailable(): Promise<boolean> { return true; }
  async getRateLimitStatus() { return { remaining: 999, limit: 1000, resetsAt: null }; }

  async complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    // Detect what kind of response the agent expects by inspecting the prompt
    const prompt = `${req.systemPrompt} ${req.messages.map((m) => m.content).join(' ')}`.toLowerCase();
    let content: string;

    if (req.responseFormat === 'json') {
      content = this.generateMockJSON(prompt);
    } else {
      content = this.generateMockText(prompt);
    }

    return {
      content,
      model: 'mock-dev-mode',
      usage: { inputTokens: prompt.length, outputTokens: content.length, totalTokens: prompt.length + content.length },
      finishReason: 'stop',
    };
  }

  async *completeStream(req: LLMCompletionRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const response = await this.complete(req);
    const words = response.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield { content: (i > 0 ? ' ' : '') + words[i], done: i === words.length - 1 };
    }
  }

  private generateMockJSON(prompt: string): string {
    // Intent parser MUST be checked first.
    // The intent prompt lists actions like "research_trends", so a later
    // "research && trends" match would steal every intent parse and return
    // the wrong JSON shape (action undefined → forced clarification loop).
    if (
      prompt.includes('intent parser')
      || prompt.includes('structured intent')
      || prompt.includes('parse this user message')
    ) {
      return JSON.stringify(this.parseMockIntent(prompt));
    }

    // Research Agent
    if (prompt.includes('research') && prompt.includes('trends')) {
      return JSON.stringify({
        trends: [{ query: "Dev Mode Topic", volume: 50000, growth: 25, timeframe: "7d", platform: "youtube", relatedQueries: ["AI", "technology"] }],
        keywords: [{ term: "dev mode test", searchVolume: 10000, competition: "low", relevanceScore: 85, intent: "informational" }],
        competitors: [{ name: "TestChannel", platform: "youtube", subscriberCount: 100000, recentVideoCount: 10, averageViews: 5000, topPerformingTopics: ["AI"], contentGaps: ["tutorials"], strengths: ["consistency"], weaknesses: ["editing"] }],
        audience: { primaryAge: "18-35", interests: ["technology", "AI"], painPoints: ["information overload"], contentPreferences: ["short-form"], activePlatforms: ["youtube"], peakActivityHours: ["14:00-18:00"], languagePreferences: ["en"] },
        topAngles: ["Beginner guide", "Top 5 list", "How it works"],
        contentGaps: ["Step-by-step tutorials", "Real-world examples"],
        references: [{ title: "Dev Mode Reference", url: "https://example.com", source: "mock", relevance: 80 }],
        scores: { trendScore: 72, difficultyScore: 35, opportunityScore: 80, confidenceScore: 85 },
      });
    }

    // Content Planner
    if (prompt.includes('content plan') || prompt.includes('video ideas')) {
      const count = (prompt.match(/(\d+)\s*video/)?.[1] ?? '3');
      const ideas = Array.from({ length: parseInt(count) }, (_, i) => ({
        id: `idea-${i + 1}`, title: `Dev Mode Video #${i + 1}: Test Topic`, description: `A compelling video about the topic from a unique angle #${i + 1}`,
        angle: `Unique perspective #${i + 1}`, targetKeywords: ["test", "dev-mode"], estimatedViews: "5K-20K",
        difficulty: "medium", priority: i + 1, hook: `Did you know this surprising fact about topic #${i + 1}?`, contentType: "educational",
      }));
      return JSON.stringify({
        ideas,
        publishingStrategy: { frequency: "3 times per week", bestTimes: ["14:00 UTC", "18:00 UTC"], platformNotes: "Dev mode test", sequencing: "Start with hooks" },
        estimates: { totalCostUsd: 0, totalDurationMinutes: 5, costPerVideo: 0, timePerVideoMinutes: 2 },
      });
    }

    // Script Planner
    if (prompt.includes('script') && (prompt.includes('hook') || prompt.includes('narration'))) {
      return JSON.stringify({
        hook: { text: "Did you know that this amazing fact could change everything?", type: "question", estimatedAttentionGrab: 85 },
        story: { text: "Here's what most people don't understand about this topic. The truth is far more interesting than you think.", structure: "problem_solution", keyPoints: ["Point one", "Point two", "Key takeaway"] },
        cta: { text: "If you found this valuable, hit subscribe and share with someone who needs to hear this!", type: "subscribe", placement: "end" },
        fullNarration: "Did you know that this amazing fact could change everything? Here's what most people don't understand about this topic. The truth is far more interesting than you think. Point one is crucial. Point two builds on that. The key takeaway is that action matters. If you found this valuable, hit subscribe!",
        scenes: [
          { id: "scene-1", order: 1, narration: "Did you know that this amazing fact could change everything?", visualNotes: "Dramatic close-up with text overlay", cameraAngle: "close-up", cameraMovement: "slow-zoom", emotion: "curiosity", duration: 5, transition: "fade" },
          { id: "scene-2", order: 2, narration: "Here's what most people don't understand about this topic.", visualNotes: "Wide shot of relevant imagery", cameraAngle: "wide", cameraMovement: "pan-right", emotion: "surprise", duration: 8, transition: "smooth_cut" },
          { id: "scene-3", order: 3, narration: "The truth is far more interesting than you think.", visualNotes: "Dynamic montage of key visuals", cameraAngle: "medium", cameraMovement: "static", emotion: "excitement", duration: 7, transition: "zoom_in" },
          { id: "scene-4", order: 4, narration: "Point one is crucial. Point two builds on that.", visualNotes: "Split screen comparison", cameraAngle: "medium", cameraMovement: "tracking", emotion: "determination", duration: 10, transition: "slide_left" },
          { id: "scene-5", order: 5, narration: "If you found this valuable, hit subscribe!", visualNotes: "Subscribe button animation with channel branding", cameraAngle: "close-up", cameraMovement: "zoom_in", emotion: "excitement", duration: 5, transition: "fade" },
        ],
        metadata: { wordCount: 85, estimatedDuration: 35, readabilityScore: 82, emotionalArc: ["curiosity", "surprise", "excitement", "determination", "action"], hookStrength: 85, ctaStrength: 78, tone: "professional" },
      });
    }

    // Prompt Optimizer
    if (prompt.includes('prompt engineer') || prompt.includes('image prompt')) {
      return JSON.stringify({
        prompts: [
          { sceneId: "scene-1", sceneOrder: 1, imagePrompt: "A dramatic close-up shot of a glowing blue digital interface, cinematic lighting, 4K, photorealistic", negativePrompt: "blurry, low quality, text, watermark", videoPrompt: "Slow zoom into the interface", cameraAngle: "close-up", cameraMovement: "slow-zoom", lighting: "dramatic blue rim light", mood: "mysterious", colorPalette: ["#4263eb", "#1a1a2e", "#16213e"], lens: "85mm", composition: "centered", style: "cinematic" },
          { sceneId: "scene-2", sceneOrder: 2, imagePrompt: "Wide aerial view of a futuristic city skyline at golden hour, ultra detailed, 8K", negativePrompt: "blurry, low quality, text", videoPrompt: "Pan right across cityscape", cameraAngle: "wide", cameraMovement: "pan-right", lighting: "golden hour", mood: "awe", colorPalette: ["#f59f00", "#ff6b6b", "#4263eb"], lens: "24mm", composition: "rule of thirds", style: "cinematic" },
        ],
        globalStyle: "Cinematic, photorealistic, high contrast, dramatic lighting",
        consistencyNotes: "Maintain blue-gold color grading across all scenes",
      });
    }

    // SEO Generator
    if (prompt.includes('seo') || prompt.includes('title') && prompt.includes('tags')) {
      return JSON.stringify({
        title: "This Changes Everything About AI (Dev Mode)",
        description: "Discover the surprising truth about AI technology that nobody talks about. In this video, we break down the key facts and show you why this matters.\n\n🔔 Subscribe for more content!\n\n#AI #Technology #Future",
        keywords: ["AI", "technology", "future", "innovation", "machine learning"],
        tags: ["AI explained", "technology trends", "future of AI", "machine learning", "artificial intelligence"],
        hashtags: ["#AI", "#Tech", "#Future", "#Innovation", "#Shorts"],
        thumbnailText: "THIS CHANGES EVERYTHING",
        pinnedComment: "What do you think about AI? Drop your thoughts below! 👇",
        cta: "Subscribe and hit the bell for weekly AI insights!",
        category: "Science & Technology",
      });
    }

    // Strategy / Recommendations
    if (prompt.includes('recommend') || prompt.includes('strategy')) {
      return JSON.stringify({
        recommendations: [
          { type: "topic", priority: "high", title: "Create more educational content", description: "Educational content performs 3x better than entertainment in your niche", expectedImpact: "+40% views", confidence: 0.85, actionable: true, action: "Create 5 educational videos this week" },
          { type: "timing", priority: "medium", title: "Post between 2-4 PM", description: "Your audience is most active in the afternoon", expectedImpact: "+20% initial views", confidence: 0.75, actionable: true, action: "Schedule next 3 videos for 3 PM" },
        ],
      });
    }

    // Trend Monitor
    if (prompt.includes('trend') && prompt.includes('emerging')) {
      return JSON.stringify({
        emergingTrends: [{ topic: "Dev Mode Trend", platform: "youtube", velocity: 75, relevance: 80, source: "mock" }],
        breakingTopics: [{ topic: "Test Breaking News", urgency: "medium", window: "48 hours" }],
        viralOpportunities: [{ topic: "Viral Test Topic", estimatedReach: "100K", competition: "low", suggestedAngle: "First-mover angle" }],
        nicheInsights: ["Dev mode insight: Test workflows end-to-end"],
      });
    }

    // Learning / Performance patterns
    if (prompt.includes('pattern') || prompt.includes('learn')) {
      return JSON.stringify({ patterns: [{ category: "hook", pattern: "Questions perform best", score: 85, confidence: 0.8 }] });
    }

    // Performance prediction
    if (prompt.includes('predict') && prompt.includes('views')) {
      return JSON.stringify({
        predictedViews: { low: 500, mid: 2000, high: 10000 }, predictedCtr: 6.5, predictedWatchTime: 25,
        predictedEngagement: 4.2, viralityScore: 35, confidence: 0.6,
        factors: [{ factor: "Strong hook", impact: "positive", weight: 0.3 }],
      });
    }

    // Music
    if (prompt.includes('music') || prompt.includes('background')) {
      return JSON.stringify({ genre: "cinematic", mood: "inspirational", tempo: 120, style: "orchestral", instruments: ["piano", "strings"], energyLevel: "medium" });
    }

    // Default
    return JSON.stringify({ result: "Dev mode mock response", status: "success" });
  }

  /**
   * Heuristic intent parse for development mode (no real LLM key).
   * Extracts the quoted user message from the intent-parser prompt.
   */
  private parseMockIntent(prompt: string): Record<string, unknown> {
    const quoted = prompt.match(/parse this user message into a structured intent:\s*"([^"]+)"/i);
    const message = (quoted?.[1] ?? '').trim();
    const lower = message.toLowerCase();

    const countMatch = lower.match(/\b(\d+)\b/);
    const count = countMatch ? Math.max(1, Math.min(100, parseInt(countMatch[1]!, 10))) : 1;

    let platform: string | null = null;
    let format: string | null = null;
    if (/\byoutube\s*shorts?\b|\bshorts?\b/.test(lower)) {
      platform = 'youtube_shorts';
      format = 'short';
    } else if (/\btiktok\b/.test(lower)) {
      platform = 'tiktok';
      format = 'short';
    } else if (/\breels?\b|\binstagram\b/.test(lower)) {
      platform = 'instagram_reels';
      format = 'short';
    } else if (/\byoutube\b/.test(lower)) {
      platform = 'youtube';
      format = 'long';
    }

    const extractTopic = (patterns: RegExp[]): string | null => {
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match?.[1]) {
          const topic = match[1].trim().replace(/[.!?]+$/, '');
          if (topic.length >= 2) return topic;
        }
      }
      return null;
    };

    let action = 'general_chat';
    let topic: string | null = null;
    let confidence = 0.9;

    if (/\b(research|search|trends?|trending|topics?)\b/.test(lower)) {
      action = 'research_trends';
      topic = extractTopic([
        /(?:research|search|trends?|trending|topics?)\s+(?:top\s+\d+\s+)?(?:topics?\s+)?(?:on\s+|for\s+|about\s+)?(.+)/i,
        /(?:top\s+\d+\s+topics?)\s+(.+)/i,
      ]) ?? (platform ? platform.replace(/_/g, ' ') : 'trending topics');
    } else if (/\b(ideas?|brainstorm)\b/.test(lower)) {
      action = 'generate_ideas';
      topic = extractTopic([/ideas?\s+(?:for|about)\s+(.+)/i, /about\s+(.+)/i]) ?? 'content ideas';
    } else if (/\b(script)\b/.test(lower)) {
      action = 'generate_script';
      topic = extractTopic([/script\s+(?:for|about|on)\s+(.+)/i, /about\s+(.+)/i]);
    } else if (/\b(thumbnail)\b/.test(lower)) {
      action = 'create_thumbnail';
      topic = extractTopic([/thumbnail\s+(?:for|about|on)\s+(.+)/i, /about\s+(.+)/i]);
    } else if (/\b(image|picture|photo)\b/.test(lower)) {
      action = 'generate_image';
      topic = extractTopic([/(?:image|picture|photo)\s+(?:of|about|for)\s+(.+)/i, /about\s+(.+)/i]);
    } else if (/\b(voiceover|voice\s*over|tts)\b/.test(lower)) {
      action = 'generate_voiceover';
      topic = extractTopic([/(?:voiceover|voice\s*over)\s+(?:for|about|on)\s+(.+)/i, /about\s+(.+)/i]);
    } else if (/\b(seo|title|tags|hashtags)\b/.test(lower)) {
      action = 'generate_seo';
      topic = extractTopic([/(?:seo|titles?|tags?)\s+(?:for|about)\s+(.+)/i, /about\s+(.+)/i]);
    } else if (/\b(create|generate|make|produce|build)\b/.test(lower) && /\b(videos?|shorts?|reels?|clips?)\b/.test(lower)) {
      action = 'create_video';
      topic = extractTopic([
        /(?:create|generate|make|produce|build)\s+(?:\d+\s+)?(?:youtube\s+)?(?:shorts?|videos?|reels?|clips?)\s+(?:about|on|for)\s+(.+)/i,
        /(?:videos?|shorts?|reels?|clips?)\s+(?:about|on|for)\s+(.+)/i,
        /(?:create|generate|make)\s+(?:a\s+)?(.+?)\s+videos?/i,
        /(?:about|on|for)\s+(.+)/i,
      ]);
      if (!platform) {
        platform = 'youtube_shorts';
        format = 'short';
      }
    } else if (/\b(create|generate|make|produce)\b/.test(lower)) {
      action = 'create_video';
      topic = extractTopic([
        /(?:create|generate|make|produce)\s+(?:\d+\s+)?(?:about|on)\s+(.+)/i,
        /(?:about|on|for)\s+(.+)/i,
        /(?:create|generate|make|produce)\s+(.+)/i,
      ]);
      if (!platform) {
        platform = 'youtube_shorts';
        format = 'short';
      }
    } else if (/^(hi|hello|hey|helo|how are you|how was the day|thanks|thank you)\b/.test(lower) || lower.length < 12) {
      action = 'general_chat';
      confidence = 0.95;
    }

    const missingRequired: string[] = [];
    const needsTopic = ['create_video', 'generate_script', 'create_thumbnail', 'generate_image', 'generate_voiceover'].includes(action);
    if (needsTopic && !topic) {
      missingRequired.push('topic');
    }

    const requiresClarification = missingRequired.length > 0;
    const clarificationQuestion = requiresClarification
      ? 'What topic would you like the content to be about?'
      : null;

    return {
      action,
      confidence,
      entities: {
        topic,
        count,
        contentType: action === 'create_video' ? 'educational' : null,
        platform,
        format,
        style: action === 'create_video' ? 'educational' : null,
        tone: 'professional',
        duration: null,
        language: 'en',
        voiceId: null,
        artStyle: null,
        scheduleDate: null,
        projectId: null,
        priority: 'normal',
        additionalInstructions: null,
      },
      missingRequired,
      requiresClarification,
      clarificationQuestion,
    };
  }

  private generateMockText(prompt: string): string {
    if (prompt.includes('improve') || prompt.includes('evolve')) {
      return "A dramatic cinematic shot of advanced technology, photorealistic, 8K resolution, dramatic lighting, blue and gold color grading, professional photography, ultra detailed";
    }

    // Respond to the actual user message for general chat
    const lastUser = prompt.match(/(?:^|\s)(hi|hello|hey|helo|how are you|how was the day|thanks|thank you)[\s!?.]*$/i)
      ?? prompt.match(/content:\s*([^\n]+)$/i);
    const msg = (lastUser?.[1] ?? '').toLowerCase();
    if (/^(hi|hello|hey|helo)\b/.test(msg)) {
      return "Hello! I'm CreatorAI Studio. I can help you create videos, scripts, thumbnails, and more. Try: \"Generate a car video\" or \"Search top YouTube topics\".";
    }
    if (/how (are you|was the day)/.test(msg) || prompt.includes('how was the day') || prompt.includes('how are you')) {
      return "I'm doing well — ready to create content with you. What would you like to make today? For example: \"Create 5 YouTube Shorts about electric cars\".";
    }
    return "I'm here to help you create content. Try commands like \"Generate a car video\", \"Research trending YouTube topics\", or \"Write a script about AI\".";
  }
}
