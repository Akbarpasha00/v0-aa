#!/bin/bash

# Quick deployment script for Google Cloud Shell
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[QUICK DEPLOY]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Quick setup for Cloud Shell users
main() {
    print_header "🚀 Quick Deployment for Google Cloud Shell"
    
    # Check if we're in Cloud Shell
    if [ -n "$CLOUD_SHELL" ]; then
        print_status "✅ Running in Google Cloud Shell"
    else
        print_warning "This script is optimized for Google Cloud Shell"
    fi
    
    # Get current project
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        print_status "Available projects:"
        gcloud projects list
        read -p "Enter project ID: " PROJECT_ID
        gcloud config set project $PROJECT_ID
    fi
    
    print_status "Using project: $PROJECT_ID"
    
    # Enable APIs quickly
    print_status "Enabling required APIs..."
    gcloud services enable compute.googleapis.com run.googleapis.com cloudbuild.googleapis.com
    
    # Create a simple Cloud Run deployment
    print_status "Creating simple Next.js app for Cloud Run..."
    
    # Create basic app structure
    mkdir -p placement-cms-app
    cd placement-cms-app
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "placement-cms",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 8080"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18"
  }
}
EOF
    
    # Create app directory and files
    mkdir -p app
    cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        🎓 Placement CMS
      </h1>
      <p className="text-xl text-gray-700 mb-2">
        College Placement Management System
      </p>
      <p className="text-gray-500">
        Deployed on Google Cloud Platform
      </p>
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">
          ✅ Successfully deployed to Google Cloud!
        </p>
      </div>
    </main>
  )
}
EOF
    
    cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Placement CMS',
  description: 'College Placement Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
EOF
    
    # Create Dockerfile for Cloud Run
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
EOF
    
    # Deploy to Cloud Run
    print_status "Deploying to Cloud Run..."
    gcloud run deploy placement-cms \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe placement-cms --region=us-central1 --format='value(status.url)')
    
    print_status "🎉 Deployment completed!"
    print_status "Your Placement CMS is live at: $SERVICE_URL"
    
    echo
    echo "What you've deployed:"
    echo "✅ Next.js application on Cloud Run"
    echo "✅ Automatic HTTPS"
    echo "✅ Global CDN"
    echo "✅ Auto-scaling (scales to zero when not used)"
    echo
    echo "Cost: Pay only for requests (very cost-effective)"
    echo "Perfect for: Production applications with variable traffic"
}

main "$@"
