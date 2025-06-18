#!/bin/bash
set -e

echo "🚀 Deploying Placement CMS to Cloudflare Workers (v4 Compatible)"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check wrangler version
echo "📋 Checking Wrangler version..."
wrangler --version

# Check authentication
echo "🔐 Checking authentication..."
if ! wrangler auth whoami &> /dev/null; then
    echo "❌ Not authenticated with Cloudflare. Please run:"
    echo "   wrangler auth login"
    exit 1
fi

echo "✅ Authentication verified"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Validate configuration
echo "🔍 Validating wrangler.toml..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    exit 1
fi

# Check if src/index.ts exists
if [ ! -f "src/index.ts" ]; then
    echo "❌ src/index.ts not found!"
    exit 1
fi

echo "✅ Configuration validated"

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
echo "This may take a few minutes..."

if wrangler deploy; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "=================================================="
    echo ""
    echo "✅ Your Placement CMS is now live on Cloudflare Workers!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit your Worker URL to see the application"
    echo "2. Optional: Set up D1 database for persistent data"
    echo "3. Optional: Configure custom domain"
    echo ""
    echo "🔧 Useful commands:"
    echo "• View logs: wrangler tail"
    echo "• Local development: wrangler dev"
    echo "• Check deployment: wrangler deployments list"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "=================================================="
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check your authentication: wrangler auth whoami"
    echo "2. Verify your account has Workers enabled"
    echo "3. Check for any syntax errors in src/index.ts"
    echo "4. Try deploying with verbose output: wrangler deploy --verbose"
    echo ""
    exit 1
fi
