# ============================================================
# CreatorAI Studio — Server Dockerfile
# ============================================================
# Multi-stage build: install → build → production runtime
# Includes FFmpeg for video rendering
# ============================================================

# ── Stage 1: Install dependencies ──
FROM node:20-slim AS deps

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/agents/package.json ./packages/agents/
COPY packages/providers/package.json ./packages/providers/
COPY packages/database/package.json ./packages/database/
COPY packages/orchestrator/package.json ./packages/orchestrator/
COPY packages/automation/package.json ./packages/automation/
COPY apps/server/package.json ./apps/server/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM node:20-slim AS builder

RUN npm install -g pnpm@9 turbo

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY --from=deps /app/apps/server/node_modules ./apps/server/
COPY . .

# Build all packages and server
RUN turbo run build --filter=@creatorai/server

# ── Stage 3: Production runtime ──
FROM node:20-slim AS runner

# Install FFmpeg (required for video rendering)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/v1/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Start server
CMD ["node", "apps/server/dist/index.js"]
