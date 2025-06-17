#!/bin/bash

# Free Tier Setup Guide
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[TIP]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Create accounts guide
create_accounts() {
    print_header "Step 1: Create Free Accounts"
    
    echo "Create accounts on these platforms:"
    echo
    echo "1. Supabase (Database)"
    echo "   URL: https://supabase.com"
    echo "   What: Free PostgreSQL database + Auth"
    echo "   Limits: 500MB database, 50MB file storage"
    echo
    echo "2. Vercel (Hosting)"
    echo "   URL: https://vercel.com"
    echo "   What: Free Next.js hosting"
    echo "   Limits: 100GB bandwidth/month"
    echo
    echo "3. GitHub (Code Repository)"
    echo "   URL: https://github.com"
    echo "   What: Free code hosting"
    echo "   Limits: Unlimited public repos"
    echo
    
    read -p "Press Enter when you've created these accounts..."
}

# Setup Supabase
setup_supabase_project() {
    print_header "Step 2: Setup Supabase Project"
    
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Click 'New Project'"
    echo "3. Choose your organization"
    echo "4. Enter project details:"
    echo "   - Name: placement-cms"
    echo "   - Database Password: (choose a strong password)"
    echo "   - Region: (choose closest to your users)"
    echo "5. Click 'Create new project'"
    echo "6. Wait for project to be ready (2-3 minutes)"
    echo
    
    read -p "Press Enter when your Supabase project is ready..."
    
    echo "7. Go to Settings → API"
    echo "8. Copy these values:"
    echo "   - Project URL"
    echo "   - anon public key"
    echo "   - service_role key"
    echo
    
    read -p "Press Enter when you have copied the API keys..."
}

# Setup database tables
setup_database() {
    print_header "Step 3: Setup Database Tables"
    
    echo "1. In Supabase dashboard, go to SQL Editor"
    echo "2. Click 'New Query'"
    echo "3. Copy and paste this SQL:"
    echo
    
    cat << 'EOF'
-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    branch VARCHAR(100) NOT NULL,
    btech_percentage DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'Eligible',
    mobile VARCHAR(15),
    gender VARCHAR(10),
    year_of_passout INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    drive_date DATE,
    package VARCHAR(100),
    open_positions INTEGER,
    min_criteria TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO students (name, email, roll_no, branch, btech_percentage, status) VALUES
('John Doe', 'john@example.com', 'CS2025001', 'Computer Science', 85.5, 'Eligible'),
('Jane Smith', 'jane@example.com', 'CS2025002', 'Computer Science', 92.0, 'Placed'),
('Mike Johnson', 'mike@example.com', 'EC2025001', 'Electronics', 78.5, 'Interview');

INSERT INTO companies (name, drive_date, package, open_positions, min_criteria) VALUES
('TechCorp Solutions', '2025-03-15', '₹18 LPA', 25, 'BTech 70% or above'),
('Global Systems Inc', '2025-03-20', '₹22 LPA', 15, 'BTech 75% or above'),
('Innovation Labs', '2025-03-25', '₹16 LPA', 30, 'BTech 65% or above');
EOF
    
    echo
    echo "4. Click 'Run' to execute the SQL"
    echo "5. Verify tables are created in Table Editor"
    echo
    
    read -p "Press Enter when database setup is complete..."
}

# Setup GitHub repository
setup_github() {
    print_header "Step 4: Setup GitHub Repository"
    
    echo "1. Go to https://github.com"
    echo "2. Click 'New repository'"
    echo "3. Repository name: placement-cms"
    echo "4. Make it Public (required for free Vercel)"
    echo "5. Click 'Create repository'"
    echo
    echo "6. In your local project folder, run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/placement-cms.git"
    echo "   git push -u origin main"
    echo
    
    read -p "Press Enter when code is pushed to GitHub..."
}

# Deploy to Vercel
deploy_to_vercel() {
    print_header "Step 5: Deploy to Vercel"
    
    echo "1. Go to https://vercel.com"
    echo "2. Click 'Import Project'"
    echo "3. Import from GitHub"
    echo "4. Select your placement-cms repository"
    echo "5. Configure project:"
    echo "   - Framework Preset: Next.js"
    echo "   - Root Directory: ./"
    echo "6. Add Environment Variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL: (your Supabase URL)"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: (your anon key)"
    echo "   - SUPABASE_SERVICE_ROLE_KEY: (your service role key)"
    echo "7. Click 'Deploy'"
    echo "8. Wait for deployment (2-3 minutes)"
    echo
    
    read -p "Press Enter when deployment is complete..."
}

# Final steps
final_steps() {
    print_header "🎉 Deployment Complete!"
    
    echo "Your Placement CMS is now live!"
    echo
    echo "What you get for FREE:"
    echo "✅ Professional placement management system"
    echo "✅ Student and company management"
    echo "✅ Real-time database with Supabase"
    echo "✅ Global CDN with Vercel"
    echo "✅ Automatic HTTPS"
    echo "✅ No server maintenance"
    echo
    echo "Free tier limits:"
    echo "📊 Database: 500MB (thousands of records)"
    echo "🌐 Bandwidth: 100GB/month"
    echo "📁 File storage: 50MB"
    echo "⚡ Serverless functions: Unlimited"
    echo
    echo "Next steps:"
    echo "1. Test your application"
    echo "2. Add your college branding"
    echo "3. Import real student data"
    echo "4. Configure email notifications"
    echo "5. Set up custom domain (optional)"
    echo
    print_warning "Bookmark your Vercel dashboard and Supabase project!"
}

# Cost calculator
show_costs() {
    print_header "💰 Cost Breakdown"
    
    echo "FREE TIER (Recommended for small colleges):"
    echo "- Supabase: $0/month (up to 500MB database)"
    echo "- Vercel: $0/month (up to 100GB bandwidth)"
    echo "- Total: $0/month"
    echo
    echo "PAID TIER (For larger colleges):"
    echo "- Supabase Pro: $25/month (8GB database)"
    echo "- Vercel Pro: $20/month (1TB bandwidth)"
    echo "- Total: $45/month"
    echo
    echo "ENTERPRISE (For universities):"
    echo "- Custom pricing based on usage"
    echo "- Dedicated support"
    echo "- SLA guarantees"
}

# Main setup flow
main() {
    echo "🚀 Free Deployment Setup for Placement CMS"
    echo "==========================================="
    echo
    
    show_costs
    echo
    
    read -p "Continue with free setup? (y/N): " continue_setup
    if [[ ! $continue_setup =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    create_accounts
    setup_supabase_project
    setup_database
    setup_github
    deploy_to_vercel
    final_steps
}

# Run main function
main "$@"
