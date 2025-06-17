#!/bin/bash
set -e

echo "🚀 Deploying Placement CMS to Cloudflare Workers"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please login to Cloudflare:"
    wrangler login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create D1 database
echo "🗄️ Setting up D1 database..."
DB_NAME="placement-cms-db"

# Check if database exists
if ! wrangler d1 list | grep -q "$DB_NAME"; then
    echo "Creating D1 database: $DB_NAME"
    wrangler d1 create $DB_NAME
    
    echo "⚠️  Please update your wrangler.toml with the database_id from above"
    echo "Then run the schema setup:"
    echo "wrangler d1 execute $DB_NAME --file=./schema.sql"
else
    echo "Database $DB_NAME already exists"
fi

# Create KV namespace
echo "🗂️ Setting up KV namespace..."
KV_NAME="PLACEMENT_DATA"

if ! wrangler kv:namespace list | grep -q "$KV_NAME"; then
    echo "Creating KV namespace: $KV_NAME"
    wrangler kv:namespace create $KV_NAME
    wrangler kv:namespace create $KV_NAME --preview
    
    echo "⚠️  Please update your wrangler.toml with the KV namespace IDs from above"
else
    echo "KV namespace $KV_NAME already exists"
fi

# Deploy to staging first
echo "🚀 Deploying to staging..."
wrangler deploy --env staging

echo ""
echo "✅ Staging deployment completed!"
echo ""
echo "🌐 Your Placement CMS is now live on Cloudflare Workers!"
echo ""
echo "📋 Next steps:"
echo "1. Update wrangler.toml with your database_id and KV namespace IDs"
echo "2. Run: wrangler d1 execute placement-cms-db --file=./schema.sql"
echo "3. Deploy to production: wrangler deploy --env production"
echo ""
echo "🔧 Useful commands:"
echo "• View logs: wrangler tail"
echo "• Local development: wrangler dev"
echo "• Database console: wrangler d1 execute placement-cms-db --command='SELECT * FROM students;'"
echo ""
EOF

chmod +x deploy-cloudflare.sh
