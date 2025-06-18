#!/bin/bash
set -e

echo "🔧 Fixing Cloudflare Worker Name Issue"
echo "======================================"

# Check authentication
if ! wrangler auth whoami &> /dev/null; then
    echo "❌ Not authenticated with Cloudflare. Please run:"
    echo "   wrangler auth login"
    exit 1
fi

echo "✅ Authenticated with Cloudflare"

# List existing workers
echo ""
echo "📋 Your existing Workers:"
wrangler list || echo "No existing workers found or error listing workers"

echo ""
echo "🎯 Choose an option:"
echo "1. Create a new Worker with a unique name"
echo "2. Use an existing Worker name"
echo "3. Generate a random unique name"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        read -p "Enter a unique name for your Worker (e.g., placement-cms-$(date +%s)): " worker_name
        ;;
    2)
        read -p "Enter the exact name of your existing Worker: " worker_name
        ;;
    3)
        worker_name="placement-cms-$(date +%s)"
        echo "Generated name: $worker_name"
        ;;
    *)
        echo "Invalid choice. Using default name."
        worker_name="placement-cms-$(date +%s)"
        ;;
esac

# Update wrangler.toml
echo ""
echo "📝 Updating wrangler.toml with name: $worker_name"

cat > wrangler.toml << EOF
name = "$worker_name"
main = "src/index.ts"
compatibility_date = "2024-01-15"
compatibility_flags = ["nodejs_compat"]

# Environment variables
[vars]
NODE_ENV = "production"
APP_NAME = "Placement CMS"

# Uncomment and configure after creating resources
# [[kv_namespaces]]
# binding = "PLACEMENT_DATA"
# id = "your-kv-namespace-id"
# preview_id = "your-preview-kv-namespace-id"

# [[d1_databases]]
# binding = "DB"
# database_name = "placement-cms-db"
# database_id = "your-database-id"
EOF

echo "✅ Updated wrangler.toml"

# Verify the configuration
echo ""
echo "🔍 Current configuration:"
cat wrangler.toml

echo ""
echo "🚀 Ready to deploy! Run:"
echo "   wrangler deploy"
echo ""
echo "Or use the deployment script:"
echo "   ./deploy-cloudflare-v4.sh"
