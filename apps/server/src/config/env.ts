// ============================================================
// CreatorAI Studio — Environment Configuration
// ============================================================
// Centralized environment variable access with validation.
// Every env var used anywhere in the server MUST be declared here.
// ============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file (development only — Vercel injects env vars in production)
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../.env' });

/**
 * Environment variable schema — validates all required vars at startup.
 * The server will fail fast if required variables are missing.
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DEVELOPMENT_MODE: z.coerce.boolean().default(true),
  PORT: z.coerce.number().default(3001),
  API_BASE_URL: z.string().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // Free LLM (Gemini)
  GEMINI_API_KEY: z.string().optional(),

  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  OPENAI_TIMEOUT: z.coerce.number().default(120000),
  ANTHROPIC_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_DEFAULT_MODEL: z.string().default('flux-schnell'),
  REPLICATE_TIMEOUT: z.coerce.number().default(300000),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_DEFAULT_VOICE: z.string().default('pNInz6obpgDQGcFmaJgB'),
  ELEVENLABS_MODEL: z.string().default('eleven_multilingual_v2'),
  ELEVENLABS_TIMEOUT: z.coerce.number().default(60000),
  RUNWAY_API_KEY: z.string().optional(),

  // Video Generation
  VIDEO_PROVIDER: z.enum(['mock', 'google_veo', 'runway', 'kling', 'luma', 'pika']).default('mock'),
  GOOGLE_VEO_API_KEY: z.string().optional(),
  KLING_API_KEY: z.string().optional(),
  LUMA_API_KEY: z.string().optional(),
  PIKA_API_KEY: z.string().optional(),

  // Pollinations.ai (free, no key needed)
  POLLINATIONS_MODEL: z.string().default('flux'),
  POLLINATIONS_TIMEOUT: z.coerce.number().default(90000),

  // Search
  SERPAPI_API_KEY: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),

  // Social
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_REDIRECT_URI: z.string().default('http://localhost:3001/api/v1/auth/youtube/callback'),
  YOUTUBE_REFRESH_TOKEN: z.string().optional(),

  // Instagram Graph API
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_BUSINESS_ACCOUNT_ID: z.string().optional(),
  INSTAGRAM_GRAPH_VERSION: z.string().default('v23.0'),

  // Security
  ENCRYPTION_KEY: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),
});

/**
 * Parsed and validated environment variables.
 * Access this object instead of `process.env` directly.
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

/**
 * Check if we're in production.
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development.
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in test.
 */
export const isTest = env.NODE_ENV === 'test';
