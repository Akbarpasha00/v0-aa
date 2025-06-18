#!/bin/bash
set -e

echo "🚀 Deploying Placement CMS to Cloudflare Workers"
echo "================================================"

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
    echo "   Then run this script again"
    exit 1
fi

echo "✅ Authentication verified"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Validate configuration
echo "🔍 Validating configuration..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    exit 1
fi

if [ ! -f "src/index.ts" ]; then
    echo "❌ src/index.ts not found!"
    exit 1
fi

echo "✅ Configuration validated"

# Get worker name from wrangler.toml
WORKER_NAME=$(grep "^name" wrangler.toml | cut -d'"' -f2)
echo "🏷️  Worker name: $WORKER_NAME"

# Deploy to Cloudflare Workers
echo ""
echo "🚀 Deploying to Cloudflare Workers..."
echo "This may take a few minutes..."

if wrangler deploy; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "================================================"
    echo ""
    echo "✅ Your Placement CMS is now live!"
    echo "🌐 Worker URL: https://$WORKER_NAME.your-subdomain.workers.dev"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit your Worker URL to test the application"
    echo "2. Optional: Set up custom domain"
    echo "3. Optional: Configure D1 database for data persistence"
    echo ""
    echo "🔧 Useful commands:"
    echo "• View logs: wrangler tail $WORKER_NAME"
    echo "• Local development: wrangler dev"
    echo "• List deployments: wrangler deployments list"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "================================================"
    echo ""
    echo "🔍 Common solutions:"
    echo "1. Run: ./fix-worker-name.sh"
    echo "2. Check authentication: wrangler auth whoami"
    echo "3. Try with verbose output: wrangler deploy --verbose"
    echo ""
    exit 1
fi
