#!/bin/bash

# Google Cloud Platform Setup Script for Placement CMS
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[GCP]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Get current project info
get_project_info() {
    print_header "Current Google Cloud Environment"
    
    PROJECT_ID=$(gcloud config get-value project)
    ACCOUNT=$(gcloud config get-value account)
    REGION=$(gcloud config get-value compute/region || echo "us-central1")
    ZONE=$(gcloud config get-value compute/zone || echo "us-central1-a")
    
    print_status "Project ID: $PROJECT_ID"
    print_status "Account: $ACCOUNT"
    print_status "Region: $REGION"
    print_status "Zone: $ZONE"
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "No project selected. Please select a project first."
        gcloud projects list
        read -p "Enter project ID: " PROJECT_ID
        gcloud config set project $PROJECT_ID
    fi
    
    # Set default region and zone if not set
    if [ -z "$(gcloud config get-value compute/region)" ]; then
        gcloud config set compute/region us-central1
        REGION="us-central1"
    fi
    
    if [ -z "$(gcloud config get-value compute/zone)" ]; then
        gcloud config set compute/zone us-central1-a
        ZONE="us-central1-a"
    fi
}

# Enable required APIs
enable_apis() {
    print_header "Enabling Required APIs"
    
    apis=(
        "compute.googleapis.com"
        "sql-component.googleapis.com"
        "storage-component.googleapis.com"
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api
    done
    
    print_status "✅ All APIs enabled successfully"
}

# Create firewall rules
create_firewall_rules() {
    print_header "Creating Firewall Rules"
    
    # HTTP traffic
    if ! gcloud compute firewall-rules describe placement-cms-http &>/dev/null; then
        gcloud compute firewall-rules create placement-cms-http \
            --allow tcp:80 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow HTTP traffic for Placement CMS"
        print_status "✅ HTTP firewall rule created"
    else
        print_status "HTTP firewall rule already exists"
    fi
    
    # HTTPS traffic
    if ! gcloud compute firewall-rules describe placement-cms-https &>/dev/null; then
        gcloud compute firewall-rules create placement-cms-https \
            --allow tcp:443 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow HTTPS traffic for Placement CMS"
        print_status "✅ HTTPS firewall rule created"
    else
        print_status "HTTPS firewall rule already exists"
    fi
    
    # Custom port for development
    if ! gcloud compute firewall-rules describe placement-cms-dev &>/dev/null; then
        gcloud compute firewall-rules create placement-cms-dev \
            --allow tcp:3000 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow development port for Placement CMS"
        print_status "✅ Development port firewall rule created"
    else
        print_status "Development port firewall rule already exists"
    fi
}

# Create compute instance
create_compute_instance() {
    print_header "Creating Compute Engine Instance"
    
    # Check if instance already exists
    if gcloud compute instances describe placement-cms-server --zone=$ZONE &>/dev/null; then
        print_warning "Instance 'placement-cms-server' already exists"
        EXTERNAL_IP=$(gcloud compute instances describe placement-cms-server \
            --zone=$ZONE \
            --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
        print_status "Existing instance IP: $EXTERNAL_IP"
        return
    fi
    
    # Choose instance type
    echo "Choose instance type:"
    echo "1) e2-micro (Free tier: 1 vCPU, 1GB RAM) - Always free"
    echo "2) e2-small (1 vCPU, 2GB RAM) - Uses credit"
    echo "3) e2-medium (1 vCPU, 4GB RAM) - Uses credit"
    echo "4) e2-standard-2 (2 vCPU, 8GB RAM) - Uses credit"
    
    read -p "Enter choice (1-4) [2]: " instance_choice
    instance_choice=${instance_choice:-2}
    
    case $instance_choice in
        1) MACHINE_TYPE="e2-micro" ;;
        2) MACHINE_TYPE="e2-small" ;;
        3) MACHINE_TYPE="e2-medium" ;;
        4) MACHINE_TYPE="e2-standard-2" ;;
        *) MACHINE_TYPE="e2-small" ;;
    esac
    
    print_status "Creating $MACHINE_TYPE instance..."
    
    # Create startup script
    cat > startup-script.sh << 'EOF'
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose nginx git curl

# Start and enable Docker
systemctl start docker
systemctl enable docker
usermod -aG docker $USER

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create application directory
mkdir -p /home/placement-cms
chown $USER:$USER /home/placement-cms

echo "Server setup completed" > /var/log/startup-script.log
EOF
    
    # Create instance
    gcloud compute instances create placement-cms-server \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2004-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=30GB \
        --boot-disk-type=pd-standard \
        --zone=$ZONE \
        --tags=http-server,https-server \
        --metadata-from-file startup-script=startup-script.sh
    
    # Wait for instance to be ready
    print_status "Waiting for instance to be ready..."
    sleep 30
    
    # Get external IP
    EXTERNAL_IP=$(gcloud compute instances describe placement-cms-server \
        --zone=$ZONE \
        --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
    
    print_status "✅ Instance created successfully"
    print_status "External IP: $EXTERNAL_IP"
    
    # Clean up startup script
    rm -f startup-script.sh
}

# Create Cloud Storage bucket
create_storage_bucket() {
    print_header "Creating Cloud Storage Bucket"
    
    BUCKET_NAME="${PROJECT_ID}-placement-cms-storage"
    
    # Check if bucket already exists
    if gsutil ls -b gs://$BUCKET_NAME &>/dev/null; then
        print_warning "Bucket already exists: gs://$BUCKET_NAME"
        return
    fi
    
    print_status "Creating storage bucket: $BUCKET_NAME"
    
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
    
    # Set bucket permissions for public read (for uploaded files)
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
    
    print_status "✅ Storage bucket created: gs://$BUCKET_NAME"
}

# Setup Cloud SQL (optional)
setup_cloud_sql() {
    print_header "Cloud SQL Database Setup"
    
    read -p "Do you want to create a Cloud SQL database? (y/N): " create_db
    if [[ ! $create_db =~ ^[Yy]$ ]]; then
        print_status "Skipping Cloud SQL - you can use Supabase instead"
        return
    fi
    
    # Check if instance already exists
    if gcloud sql instances describe placement-cms-db &>/dev/null; then
        print_warning "Cloud SQL instance already exists"
        return
    fi
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -base64 16)
    
    print_status "Creating Cloud SQL PostgreSQL instance..."
    print_warning "This will take 5-10 minutes..."
    
    gcloud sql instances create placement-cms-db \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=HDD \
        --storage-size=10GB \
        --backup \
        --backup-start-time=03:00
    
    # Set root password
    gcloud sql users set-password postgres \
        --instance=placement-cms-db \
        --password=$DB_PASSWORD
    
    # Create application database
    gcloud sql databases create placement_cms \
        --instance=placement-cms-db
    
    print_status "✅ Cloud SQL database created"
    print_warning "Database password: $DB_PASSWORD"
    print_warning "Save this password securely!"
    
    # Save to environment file
    echo "export GCP_DB_PASSWORD=$DB_PASSWORD" >> .env.gcp
}

# Create environment file
create_environment_file() {
    print_header "Creating Environment Configuration"
    
    cat > .env.gcp << EOF
# Google Cloud Platform Configuration
export GCP_PROJECT_ID=$PROJECT_ID
export GCP_REGION=$REGION
export GCP_ZONE=$ZONE
export GCP_INSTANCE_NAME=placement-cms-server
export GCP_EXTERNAL_IP=$EXTERNAL_IP
export GCP_MACHINE_TYPE=$MACHINE_TYPE
export GCP_STORAGE_BUCKET=${PROJECT_ID}-placement-cms-storage

# Application Configuration (update these with your Supabase details)
export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
    
    print_status "✅ Environment file created: .env.gcp"
    print_warning "Please update the Supabase configuration in .env.gcp"
}

# Create deployment script
create_deployment_script() {
    print_header "Creating Deployment Script"
    
    cat > deploy-to-gcp.sh << 'EOF'
#!/bin/bash

# Deploy Placement CMS to Google Cloud Platform
set -e

# Load environment variables
if [ -f .env.gcp ]; then
    source .env.gcp
else
    echo "Error: .env.gcp file not found"
    exit 1
fi

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

# Check if Supabase is configured
check_supabase_config() {
    if [ "$NEXT_PUBLIC_SUPABASE_URL" = "your-supabase-url" ]; then
        print_warning "Supabase URL not configured in .env.gcp"
        read -p "Enter your Supabase URL: " SUPABASE_URL
        read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
        read -s -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY
        echo
        
        # Update environment file
        sed -i "s|your-supabase-url|$SUPABASE_URL|" .env.gcp
        sed -i "s|your-supabase-anon-key|$SUPABASE_ANON_KEY|" .env.gcp
        sed -i "s|your-service-role-key|$SUPABASE_SERVICE_KEY|" .env.gcp
        
        # Reload environment
        source .env.gcp
    fi
}

# Create application files if they don't exist
create_app_files() {
    if [ ! -f package.json ]; then
        print_status "Creating basic Next.js application..."
        
        # Create package.json
        cat > package.json << 'PKG_EOF'
{
  "name": "placement-cms",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
PKG_EOF
        
        # Create basic app structure
        mkdir -p app
        cat > app/page.tsx << 'PAGE_EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Placement CMS</h1>
      <p className="mt-4 text-xl">Welcome to your College Placement Management System</p>
      <p className="mt-2 text-gray-600">Deployed on Google Cloud Platform</p>
    </main>
  )
}
PAGE_EOF
        
        cat > app/layout.tsx << 'LAYOUT_EOF'
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
      <body>{children}</body>
    </html>
  )
}
LAYOUT_EOF
        
        # Create next.config.js
        cat > next.config.js << 'CONFIG_EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
CONFIG_EOF
        
        print_status "✅ Basic application files created"
    fi
}

# Wait for instance to be ready
wait_for_instance() {
    print_status "Waiting for instance to be ready..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="echo 'Instance ready'" &>/dev/null; then
            print_status "✅ Instance is ready"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for instance..."
        sleep 10
        ((attempt++))
    done
    
    print_warning "Instance may not be fully ready, continuing anyway..."
}

# Copy application files
copy_files() {
    print_status "Copying application files to GCP instance..."
    
    # Create remote directory
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="mkdir -p ~/placement-cms"
    
    # Copy files
    gcloud compute scp --recurse \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude=".next" \
        ./* $GCP_INSTANCE_NAME:~/placement-cms/ \
        --zone=$GCP_ZONE
    
    print_status "✅ Files copied successfully"
}

# Setup and deploy application
deploy_application() {
    print_status "Setting up application on GCP instance..."
    
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="
        cd ~/placement-cms
        
        # Install dependencies
        npm install
        
        # Build application
        npm run build
        
        # Create environment file
        cat > .env.production << 'ENV_EOF'
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV_EOF
        
        # Stop any existing PM2 processes
        pm2 delete placement-cms || true
        
        # Start application with PM2
        pm2 start npm --name 'placement-cms' -- start
        pm2 startup
        pm2 save
        
        # Configure nginx
        sudo tee /etc/nginx/sites-available/placement-cms << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF
        
        # Enable nginx site
        sudo ln -sf /etc/nginx/sites-available/placement-cms /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
        
        echo '✅ Application deployed successfully!'
    "
}

# Main deployment function
main() {
    print_header "🚀 Deploying Placement CMS to Google Cloud"
    
    check_supabase_config
    create_app_files
    wait_for_instance
    copy_files
    deploy_application
    
    print_status "🎉 Deployment completed!"
    print_status "Your Placement CMS is running at: http://$GCP_EXTERNAL_IP"
    print_status "SSH access: gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE"
    
    echo
    echo "Next steps:"
    echo "1. Visit http://$GCP_EXTERNAL_IP to see your application"
    echo "2. Configure your Supabase database"
    echo "3. Customize your application"
    echo "4. Set up a custom domain (optional)"
}

# Run main function
main "$@"
EOF
    
    chmod +x deploy-to-gcp.sh
    print_status "✅ Deployment script created: deploy-to-gcp.sh"
}

# Show final instructions
show_final_instructions() {
    print_header "🎉 Google Cloud Setup Complete!"
    
    echo "What you've created:"
    echo "✅ Google Cloud project: $PROJECT_ID"
    echo "✅ Compute Engine instance: $MACHINE_TYPE"
    echo "✅ External IP: $EXTERNAL_IP"
    echo "✅ Firewall rules for HTTP/HTTPS"
    echo "✅ Cloud Storage bucket"
    echo "✅ Deployment script"
    echo
    echo "Next steps:"
    echo "1. Configure Supabase credentials:"
    echo "   nano .env.gcp"
    echo
    echo "2. Deploy your application:"
    echo "   ./deploy-to-gcp.sh"
    echo
    echo "3. Access your application:"
    echo "   http://$EXTERNAL_IP"
    echo
    echo "4. SSH to your instance:"
    echo "   gcloud compute ssh placement-cms-server --zone=$ZONE"
    echo
    echo "Files created:"
    echo "- .env.gcp (GCP configuration)"
    echo "- deploy-to-gcp.sh (Deployment script)"
    echo
    print_warning "Your instance is running and will incur charges"
    print_warning "Use 'gcloud compute instances stop placement-cms-server --zone=$ZONE' to stop it"
}

# Main setup function
main() {
    print_header "☁️ Google Cloud Platform Setup for Placement CMS"
    echo "Setting up your Placement CMS on Google Cloud..."
    echo
    
    get_project_info
    enable_apis
    create_firewall_rules
    create_compute_instance
    create_storage_bucket
    setup_cloud_sql
    create_environment_file
    create_deployment_script
    show_final_instructions
    
    print_status "🎯 Google Cloud setup completed successfully!"
    print_status "Run './deploy-to-gcp.sh' to deploy your application"
}

# Run main function
main "$@"
