#!/bin/bash

# Free Deployment Script for Placement CMS
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Show deployment options
show_options() {
    print_header "Free Deployment Options for Placement CMS"
    echo
    echo "1. Vercel + Supabase (Recommended for beginners)"
    echo "   - Frontend: Vercel (Free)"
    echo "   - Database: Supabase (Free)"
    echo "   - Deployment: One command"
    echo
    echo "2. Railway (All-in-one solution)"
    echo "   - Everything on Railway"
    echo "   - $5 monthly credit"
    echo "   - Easy database setup"
    echo
    echo "3. Render (Simple web service)"
    echo "   - 750 hours/month free"
    echo "   - Auto-sleep after inactivity"
    echo "   - Good for demos"
    echo
    echo "4. Fly.io (Docker-based)"
    echo "   - 3 free VMs"
    echo "   - Global deployment"
    echo "   - Docker containers"
    echo
    echo "5. Oracle Cloud Always Free"
    echo "   - Most powerful free tier"
    echo "   - Requires setup"
    echo "   - Production-ready"
    echo
}

# Deploy to Vercel
deploy_vercel() {
    print_header "Deploying to Vercel"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Login to Vercel
    print_status "Please login to Vercel..."
    vercel login
    
    # Set environment variables
    print_status "Setting up environment variables..."
    echo "Please enter your Supabase details:"
    read -p "Supabase URL: " supabase_url
    read -p "Supabase Anon Key: " supabase_anon_key
    read -s -p "Supabase Service Role Key: " supabase_service_key
    echo
    
    # Deploy
    print_status "Deploying to Vercel..."
    vercel --prod \
        -e NEXT_PUBLIC_SUPABASE_URL="$supabase_url" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$supabase_anon_key" \
        -e SUPABASE_SERVICE_ROLE_KEY="$supabase_service_key"
    
    print_status "✅ Deployed to Vercel successfully!"
}

# Deploy to Railway
deploy_railway() {
    print_header "Deploying to Railway"
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    print_status "Please login to Railway..."
    railway login
    
    # Initialize project
    print_status "Initializing Railway project..."
    railway init
    
    # Add PostgreSQL database
    print_status "Adding PostgreSQL database..."
    railway add postgresql
    
    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set NODE_ENV=production
    
    # Deploy
    print_status "Deploying to Railway..."
    railway up
    
    print_status "✅ Deployed to Railway successfully!"
}

# Deploy to Render
deploy_render() {
    print_header "Deploying to Render"
    
    print_status "For Render deployment:"
    print_status "1. Push your code to GitHub"
    print_status "2. Connect your GitHub repo to Render"
    print_status "3. Use the render.yaml configuration"
    print_status "4. Set environment variables in Render dashboard"
    
    print_warning "Render requires GitHub integration - cannot deploy directly from CLI"
}

# Deploy to Fly.io
deploy_flyio() {
    print_header "Deploying to Fly.io"
    
    # Check if Fly CLI is installed
    if ! command -v fly &> /dev/null; then
        print_status "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
        export PATH="$HOME/.fly/bin:$PATH"
    fi
    
    # Login to Fly.io
    print_status "Please login to Fly.io..."
    fly auth login
    
    # Launch app
    print_status "Launching Fly.io app..."
    fly launch --no-deploy
    
    # Set secrets
    print_status "Setting secrets..."
    echo "Please enter your Supabase details:"
    read -p "Supabase URL: " supabase_url
    read -p "Supabase Anon Key: " supabase_anon_key
    read -s -p "Supabase Service Role Key: " supabase_service_key
    echo
    
    fly secrets set \
        NEXT_PUBLIC_SUPABASE_URL="$supabase_url" \
        NEXT_PUBLIC_SUPABASE_ANON_KEY="$supabase_anon_key" \
        SUPABASE_SERVICE_ROLE_KEY="$supabase_service_key"
    
    # Deploy
    print_status "Deploying to Fly.io..."
    fly deploy
    
    print_status "✅ Deployed to Fly.io successfully!"
}

# Setup Supabase
setup_supabase() {
    print_header "Setting up Supabase (Free Database)"
    
    print_status "1. Go to https://supabase.com"
    print_status "2. Sign up for a free account"
    print_status "3. Create a new project"
    print_status "4. Go to Settings → API"
    print_status "5. Copy your:"
    print_status "   - Project URL"
    print_status "   - Anon public key"
    print_status "   - Service role key"
    print_status "6. Run the SQL scripts to create tables"
    
    echo
    print_warning "Save these credentials - you'll need them for deployment!"
}

# Main menu
main() {
    show_options
    
    echo "Choose deployment option:"
    echo "1) Vercel + Supabase"
    echo "2) Railway"
    echo "3) Render"
    echo "4) Fly.io"
    echo "5) Setup Supabase only"
    echo "6) Show all options again"
    echo
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            setup_supabase
            echo
            deploy_vercel
            ;;
        2)
            deploy_railway
            ;;
        3)
            deploy_render
            ;;
        4)
            deploy_flyio
            ;;
        5)
            setup_supabase
            ;;
        6)
            main
            ;;
        *)
            print_warning "Invalid choice. Please try again."
            main
            ;;
    esac
}

# Run main function
main "$@"
