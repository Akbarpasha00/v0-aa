#!/bin/bash
set -e

echo "🔧 Setting up Cloudflare Workers for Placement CMS"
echo "================================================="

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

if [[ ! "$node_version" =~ ^v1[89]\. ]] && [[ ! "$node_version" =~ ^v2[0-9]\. ]]; then
    echo "⚠️  Warning: Node.js 18+ is recommended for Cloudflare Workers"
fi

# Install wrangler globally if not present
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI globally..."
    npm install -g wrangler@latest
else
    echo "✅ Wrangler CLI found"
    wrangler --version
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
if wrangler auth whoami &> /dev/null; then
    echo "✅ Already authenticated with Cloudflare"
    wrangler auth whoami
else
    echo "❌ Not authenticated. Opening browser for login..."
    wrangler auth login
fi

echo ""
echo "🎉 Setup complete!"
echo "================================================="
echo ""
echo "🚀 Ready to deploy! Run one of these commands:"
echo "• Quick deploy: ./deploy-cloudflare-v4.sh"
echo "• Manual deploy: wrangler deploy"
echo "• Local development: wrangler dev"
echo ""
