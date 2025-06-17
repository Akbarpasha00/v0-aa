#!/bin/bash
set -e

echo "🚀 Deploying Placement CMS to Cloudflare Workers (Simplified)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy directly
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your Placement CMS should now be live on Cloudflare Workers!"
echo ""
echo "📋 Next steps:"
echo "1. Set up D1 database: wrangler d1 create placement-cms-db"
echo "2. Update wrangler.toml with your database_id"
echo "3. Run schema: wrangler d1 execute placement-cms-db --file=./schema.sql"
echo ""
echo "🔧 Useful commands:"
echo "• View logs: wrangler tail"
echo "• Local development: wrangler dev"
echo ""
