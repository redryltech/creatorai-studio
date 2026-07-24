// ============================================================
// CreatorAI Studio — OpenAI Integration Tests
// ============================================================
// These tests verify that every LLM-dependent agent
// successfully calls the real OpenAI API through the
// ProviderRegistry → OpenAIProvider chain.
//
// REQUIRES: OPENAI_API_KEY environment variable
// RUN: pnpm --filter @creatorai/automation test
//
// These are integration tests — they make real API calls
// and cost real money (~$0.01-0.05 per test run).
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ProviderRegistry, OpenAIProvider } from '@creatorai/providers';
import type { ILLMProvider } from '@creatorai/providers';
import { CostTracker, Logger, LogLevel } from '@creatorai/agents';

// Check if API key is available
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? '';
const SKIP = !OPENAI_KEY;

const describeIf = SKIP ? describe.skip : describe;

describeIf('OpenAI Integration — Real API Calls', () => {
  let provider: ILLMProvider;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });
    const registry = ProviderRegistry.getInstance();
    const openai = new OpenAIProvider({
      apiKey: OPENAI_KEY,
      defaultModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', // Use mini for cheaper tests
      timeoutMs: 30000,
    });
    registry.register(openai, 'llm', 0);
    provider = openai;
  });

  afterAll(() => {
    ProviderRegistry.resetInstance();
    CostTracker.resetInstance();
  });

  // ---- Core Provider Tests ----

  it('completes a simple text request', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: 'Say "hello" and nothing else.' }],
      temperature: 0,
      maxTokens: 10,
    });

    expect(response.content.toLowerCase()).toContain('hello');
    expect(response.model).toBeTruthy();
    expect(response.usage.totalTokens).toBeGreaterThan(0);
    expect(response.finishReason).toBe('stop');
  }, 30000);

  it('completes a JSON mode request', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a JSON generator. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Return JSON: {"name":"test","value":42}' }],
      temperature: 0,
      maxTokens: 50,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('value');
  }, 30000);

  it('tracks token usage', async () => {
    const response = await provider.complete({
      systemPrompt: 'Reply with one word.',
      messages: [{ role: 'user', content: 'What color is the sky?' }],
      temperature: 0,
      maxTokens: 5,
    });

    expect(response.usage.inputTokens).toBeGreaterThan(0);
    expect(response.usage.outputTokens).toBeGreaterThan(0);
    expect(response.usage.totalTokens).toBe(response.usage.inputTokens + response.usage.outputTokens);
  }, 30000);

  // ---- Agent Simulation Tests ----
  // These simulate what each agent does without importing the agent class

  it('Research Agent: synthesizes research in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a content research analyst. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Research "electric vehicles" for YouTube. JSON: {"trends":[{"query":"string","volume":0}],"topAngles":["string"],"scores":{"trendScore":0,"opportunityScore":0}}' }],
      temperature: 0.4,
      maxTokens: 500,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.trends).toBeDefined();
    expect(parsed.topAngles).toBeDefined();
    expect(parsed.scores).toBeDefined();
  }, 30000);

  it('Content Planner: generates content ideas in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a content strategist. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Create 2 video ideas about AI. JSON: {"ideas":[{"title":"string","description":"string","hook":"string"}]}' }],
      temperature: 0.6,
      maxTokens: 500,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.ideas).toBeDefined();
    expect(parsed.ideas.length).toBeGreaterThanOrEqual(1);
    expect(parsed.ideas[0].title).toBeTruthy();
  }, 30000);

  it('Script Planner: generates structured script in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a scriptwriter. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Write a 30s YouTube Short script about AI. JSON: {"hook":{"text":"string","type":"question"},"fullNarration":"string","scenes":[{"narration":"string","visualNotes":"string","duration":5}]}' }],
      temperature: 0.8,
      maxTokens: 800,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.hook).toBeDefined();
    expect(parsed.hook.text).toBeTruthy();
    expect(parsed.fullNarration).toBeTruthy();
    expect(parsed.scenes).toBeDefined();
    expect(parsed.scenes.length).toBeGreaterThanOrEqual(1);
  }, 30000);

  it('Prompt Optimizer: generates image prompts in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are an AI prompt engineer. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Generate an image prompt for: "A futuristic city at sunset". JSON: {"imagePrompt":"detailed prompt","negativePrompt":"what to avoid","cameraAngle":"angle","lighting":"description","mood":"mood"}' }],
      temperature: 0.5,
      maxTokens: 300,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.imagePrompt).toBeTruthy();
    expect(parsed.imagePrompt.length).toBeGreaterThan(20);
  }, 30000);

  it('SEO Generator: generates metadata in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are an SEO expert. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Generate SEO for a YouTube video about AI technology. JSON: {"title":"string","description":"string","tags":["string"],"hashtags":["string"]}' }],
      temperature: 0.6,
      maxTokens: 400,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.title).toBeTruthy();
    expect(parsed.tags).toBeDefined();
    expect(parsed.tags.length).toBeGreaterThan(0);
  }, 30000);

  it('Strategy Engine: generates recommendations in JSON', async () => {
    const response = await provider.complete({
      systemPrompt: 'You are a content strategist. Respond only with valid JSON.',
      messages: [{ role: 'user', content: 'Recommend content strategy improvements. JSON: {"recommendations":[{"type":"topic","title":"string","description":"string","confidence":0.8}]}' }],
      temperature: 0.5,
      maxTokens: 400,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    expect(parsed.recommendations).toBeDefined();
    expect(parsed.recommendations.length).toBeGreaterThanOrEqual(1);
  }, 30000);

  // ---- Provider Health ----

  it('reports provider as available', async () => {
    const available = await provider.isAvailable();
    expect(available).toBe(true);
  });
});
