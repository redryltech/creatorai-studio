#!/bin/bash
# ============================================================
# CreatorAI Studio — Firebase Deploy Script
# ============================================================
# Run this on YOUR local machine (not in Arena)
#
# Prerequisites:
#   1. Node.js 18+ installed
#   2. Firebase CLI: npm install -g firebase-tools
#   3. Login: firebase login
#
# Usage:
#   chmod +x deploy-firebase.sh
#   ./deploy-firebase.sh
# ============================================================

set -e

echo "🚀 CreatorAI Studio — Firebase Deployment"
echo "==========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install -g pnpm 2>/dev/null
pnpm install --no-frozen-lockfile

# Step 2: Build the web app
echo ""
echo "🔨 Building web app..."
pnpm --filter @creatorai/web build

# Step 3: Verify build
if [ ! -f "apps/web/out/index.html" ]; then
  echo "❌ Build failed — no output found"
  exit 1
fi

echo "✅ Build successful — $(ls apps/web/out/ | wc -l) files"

# Step 4: Deploy to Firebase
echo ""
echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting --project creatorai-studio-e4de0

echo ""
echo "🎉 DEPLOYED!"
echo "🌐 Your app: https://creatorai-studio-e4de0.web.app"
echo "🌐 Alt URL:  https://creatorai-studio-e4de0.firebaseapp.com"
