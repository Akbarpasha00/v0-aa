#!/bin/bash

echo "🚀 PLACEMENT CMS INSTALLER"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.template .env.local
    echo "✅ Environment file created"
fi

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 INSTALLATION COMPLETE!"
echo "========================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Edit .env.local with your database credentials"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "🚀 DEPLOYMENT:"
echo "npm run deploy:cloudflare  # Deploy to Cloudflare"
echo "npm run deploy:vercel      # Deploy to Vercel"
echo ""
echo "✅ Your Placement CMS is ready to use!"
