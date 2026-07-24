// ============================================================
// CreatorAI Studio — Server Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { env, isDevelopment } from './config/env';
import { bootstrap } from './bootstrap';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { promptInjectionGuard, apiSecurityHeaders } from './middleware/security.middleware';
import { apiRoutes } from './routes';

async function main(): Promise<void> {
  // ---- Initialize all infrastructure ----
  await bootstrap();

  // ---- Create Express App ----
  const app = express();

  // ---- Global Middleware ----
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  app.use(generalRateLimiter);
  app.use(apiSecurityHeaders);
  app.use(promptInjectionGuard);

  // Request ID injection
  app.use((req, _res, next) => {
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] =
        `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }
    next();
  });

  // ---- Routes ----
  app.use('/api/v1', apiRoutes);

  app.get('/', (_req, res) => {
    res.json({
      name: 'CreatorAI Studio API',
      version: '0.1.0',
      docs: '/api/v1/health',
    });
  });

  // ---- Error Handling ----
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  // ---- Start Server ----
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('  🚀 CreatorAI Studio API Server');
    console.log('='.repeat(60));
    console.log(`  Environment : ${env.NODE_ENV}`);
    console.log(`  Port        : ${PORT}`);
    console.log(`  URL         : ${env.API_BASE_URL}`);
    console.log(`  CORS Origin : ${env.CORS_ORIGIN}`);
    console.log('='.repeat(60));
    console.log('');
  });
}

main().catch((error) => {
  console.error('❌ Fatal: Server failed to start', error);
  process.exit(1);
});
