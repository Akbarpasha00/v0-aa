#!/bin/bash

echo "🔐 Deploying Secure Placement CMS with Microsoft Authentication..."

# Set environment variables (you'll need to set these in Cloudflare dashboard)
echo "⚙️  Setting up environment variables..."
echo "Please set these in your Cloudflare Workers dashboard:"
echo "- JWT_SECRET: $(openssl rand -base64 32)"
echo "- MICROSOFT_CLIENT_ID: Your Azure App Registration Client ID"
echo "- MICROSOFT_CLIENT_SECRET: Your Azure App Registration Client Secret"
echo "- MICROSOFT_TENANT_ID: Your Azure AD Tenant ID (or 'common' for multi-tenant)"

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your secure CMS is now available at:"
echo "   Login: https://agilevu.com"
echo "   Dashboard: https://dashboard.agilevu.com"
echo ""
echo "🔧 Next steps:"
echo "1. Set up Azure AD App Registration"
echo "2. Configure environment variables in Cloudflare dashboard"
echo "3. Set up DNS records for subdomains"
echo "4. Test Microsoft Authenticator login"
