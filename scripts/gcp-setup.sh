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

# Check if gcloud is installed
check_gcloud_cli() {
    print_header "Checking Google Cloud CLI"
    
    if command -v gcloud &> /dev/null; then
        version=$(gcloud version --format="value(Google Cloud SDK)")
        print_status "Google Cloud CLI is installed (version: $version)"
        return 0
    else
        print_warning "Google Cloud CLI not found"
        return 1
    fi
}

# Install Google Cloud CLI
install_gcloud_cli() {
    print_header "Installing Google Cloud CLI"
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Installing for Linux..."
        
        # Add Google Cloud SDK repository
        echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
        
        # Import Google Cloud public key
        curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
        
        # Update and install
        sudo apt-get update && sudo apt-get install -y google-cloud-cli
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "Installing for macOS..."
        
        if command -v brew &> /dev/null; then
            brew install --cask google-cloud-sdk
        else
            # Download and install manually
            curl https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-456.0.0-darwin-x86_64.tar.gz -o google-cloud-cli.tar.gz
            tar -xf google-cloud-cli.tar.gz
            ./google-cloud-sdk/install.sh
            source ~/.bashrc
        fi
        
    else
        print_status "For Windows, download from:"
        print_status "https://cloud.google.com/sdk/docs/install"
        return 1
    fi
    
    # Verify installation
    if command -v gcloud &> /dev/null; then
        print_status "✅ Google Cloud CLI installed successfully"
    else
        print_error "❌ Installation failed"
        exit 1
    fi
}

# Create GCP account and project
setup_gcp_account() {
    print_header "Setting up Google Cloud Account"
    
    echo "1. Go to https://cloud.google.com/"
    echo "2. Click 'Get started for free'"
    echo "3. Sign in with your Google account (or create one)"
    echo "4. Accept terms and conditions"
    echo "5. Add payment method (for $300 credit verification)"
    echo "6. Complete account setup"
    echo
    print_warning "You'll get $300 credit valid for 90 days"
    print_warning "Free tier resources continue after credit expires"
    echo
    
    read -p "Press Enter when your GCP account is ready..."
}

# Initialize gcloud and create project
initialize_gcloud() {
    print_header "Initializing Google Cloud CLI"
    
    # Login to Google Cloud
    print_status "Please login to Google Cloud..."
    gcloud auth login
    
    # Set up application default credentials
    gcloud auth application-default login
    
    # Create new project
    read -p "Enter a project ID for your Placement CMS (e.g., placement-cms-$(date +%s)): " PROJECT_ID
    PROJECT_ID=${PROJECT_ID:-placement-cms-$(date +%s)}
    
    print_status "Creating project: $PROJECT_ID"
    gcloud projects create $PROJECT_ID --name="Placement CMS"
    
    # Set default project
    gcloud config set project $PROJECT_ID
    
    # Enable billing (required for some services)
    print_status "Please enable billing for your project in the GCP Console"
    print_status "Go to: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    
    read -p "Press Enter when billing is enabled..."
    
    # Enable required APIs
    print_status "Enabling required APIs..."
    gcloud services enable compute.googleapis.com
    gcloud services enable sql-component.googleapis.com
    gcloud services enable storage-component.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    
    # Save project info
    echo "export GCP_PROJECT_ID=$PROJECT_ID" >> .env.gcp
    echo "export GCP_REGION=us-central1" >> .env.gcp
    echo "export GCP_ZONE=us-central1-a" >> .env.gcp
    
    print_status "✅ Google Cloud initialized successfully"
}

# Create Compute Engine instance
create_compute_instance() {
    print_header "Creating Compute Engine Instance"
    
    # Set default region and zone
    gcloud config set compute/region us-central1
    gcloud config set compute/zone us-central1-a
    
    # Create firewall rules
    print_status "Creating firewall rules..."
    gcloud compute firewall-rules create placement-cms-http \
        --allow tcp:80 \
        --source-ranges 0.0.0.0/0 \
        --description "Allow HTTP traffic for Placement CMS" || true
    
    gcloud compute firewall-rules create placement-cms-https \
        --allow tcp:443 \
        --source-ranges 0.0.0.0/0 \
        --description "Allow HTTPS traffic for Placement CMS" || true
    
    gcloud compute firewall-rules create placement-cms-ssh \
        --allow tcp:22 \
        --source-ranges 0.0.0.0/0 \
        --description "Allow SSH access" || true
    
    # Create instance
    print_status "Creating Compute Engine instance..."
    
    # Choose instance type based on credit availability
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
    
    gcloud compute instances create placement-cms-server \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2004-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=30GB \
        --boot-disk-type=pd-standard \
        --tags=http-server,https-server \
        --metadata=startup-script='#!/bin/bash
            apt-get update
            apt-get install -y docker.io docker-compose nginx
            systemctl start docker
            systemctl enable docker
            usermod -aG docker $USER
            
            # Install Node.js
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            
            # Install PM2
            npm install -g pm2
            
            echo "Server setup completed" > /var/log/startup-script.log
        '
    
    # Get external IP
    EXTERNAL_IP=$(gcloud compute instances describe placement-cms-server \
        --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
    
    print_status "✅ Instance created successfully"
    print_status "External IP: $EXTERNAL_IP"
    
    # Save to environment file
    echo "export GCP_INSTANCE_NAME=placement-cms-server" >> .env.gcp
    echo "export GCP_EXTERNAL_IP=$EXTERNAL_IP" >> .env.gcp
    echo "export GCP_MACHINE_TYPE=$MACHINE_TYPE" >> .env.gcp
}

# Create Cloud SQL database
create_cloud_sql() {
    print_header "Creating Cloud SQL Database"
    
    read -p "Do you want to create a Cloud SQL database? (y/N): " create_db
    if [[ ! $create_db =~ ^[Yy]$ ]]; then
        print_status "Skipping Cloud SQL creation - you can use Supabase instead"
        return
    fi
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -base64 16)
    
    print_status "Creating Cloud SQL PostgreSQL instance..."
    
    gcloud sql instances create placement-cms-db \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=us-central1 \
        --storage-type=HDD \
        --storage-size=10GB \
        --backup \
        --enable-bin-log
    
    # Set root password
    gcloud sql users set-password postgres \
        --instance=placement-cms-db \
        --password=$DB_PASSWORD
    
    # Create application database
    gcloud sql databases create placement_cms \
        --instance=placement-cms-db
    
    # Create application user
    gcloud sql users create placement_user \
        --instance=placement-cms-db \
        --password=$DB_PASSWORD
    
    # Get connection name
    CONNECTION_NAME=$(gcloud sql instances describe placement-cms-db \
        --format='value(connectionName)')
    
    print_status "✅ Cloud SQL database created"
    print_warning "Database password: $DB_PASSWORD"
    print_warning "Save this password securely!"
    
    # Save to environment file
    echo "export GCP_DB_INSTANCE=placement-cms-db" >> .env.gcp
    echo "export GCP_DB_PASSWORD=$DB_PASSWORD" >> .env.gcp
    echo "export GCP_DB_CONNECTION_NAME=$CONNECTION_NAME" >> .env.gcp
}

# Create Cloud Storage bucket
create_storage_bucket() {
    print_header "Creating Cloud Storage Bucket"
    
    BUCKET_NAME="${PROJECT_ID}-placement-cms-storage"
    
    print_status "Creating storage bucket: $BUCKET_NAME"
    
    gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://$BUCKET_NAME
    
    # Set bucket permissions
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
    
    print_status "✅ Storage bucket created: gs://$BUCKET_NAME"
    
    # Save to environment file
    echo "export GCP_STORAGE_BUCKET=$BUCKET_NAME" >> .env.gcp
}

# Generate deployment script
generate_deployment_script() {
    print_header "Generating Deployment Script"
    
    cat > deploy-to-gcp.sh << 'EOF'
#!/bin/bash

# Deploy Placement CMS to Google Cloud Platform
set -e

# Load environment variables
source .env.gcp

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

# Wait for instance to be ready
print_status "Waiting for instance to be ready..."
sleep 60

# Copy application files
print_status "Copying application files to GCP instance..."
gcloud compute scp --recurse \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude=".next" \
    ./ placement-cms-server:~/placement-cms/

# Setup and deploy application
print_status "Setting up application on GCP instance..."
gcloud compute ssh placement-cms-server --command="
    cd ~/placement-cms
    
    # Install dependencies
    npm install
    
    # Build application
    npm run build
    
    # Create environment file
    cat > .env.production << 'ENV_EOF'
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
ENV_EOF
    
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
    
    sudo ln -sf /etc/nginx/sites-available/placement-cms /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    
    echo '✅ Application deployed successfully!'
"

print_status "🎉 Deployment completed!"
print_status "Your Placement CMS is running at: http://$GCP_EXTERNAL_IP"
print_status "SSH access: gcloud compute ssh placement-cms-server"
EOF

    chmod +x deploy-to-gcp.sh
    print_status "✅ Deployment script created: deploy-to-gcp.sh"
}

# Setup Cloud Run (alternative deployment)
setup_cloud_run() {
    print_header "Setting up Cloud Run (Serverless Option)"
    
    read -p "Do you want to setup Cloud Run deployment? (y/N): " setup_run
    if [[ ! $setup_run =~ ^[Yy]$ ]]; then
        return
    fi
    
    # Create Dockerfile for Cloud Run
    cat > Dockerfile.cloudrun << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
EOF

    # Create Cloud Run deployment script
    cat > deploy-cloud-run.sh << 'EOF'
#!/bin/bash

# Deploy to Cloud Run
set -e

source .env.gcp

# Build and deploy
gcloud run deploy placement-cms \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars NODE_ENV=production \
    --set-env-vars NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    --set-env-vars SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

echo "✅ Cloud Run deployment completed!"
EOF

    chmod +x deploy-cloud-run.sh
    print_status "✅ Cloud Run setup completed"
}

# Show cost estimation
show_cost_estimation() {
    print_header "💰 Cost Estimation"
    
    echo "With $300 credit (90 days):"
    echo "✅ e2-standard-2 instance: ~$50/month"
    echo "✅ Cloud SQL db-f1-micro: ~$7/month"
    echo "✅ 30GB storage: ~$1.20/month"
    echo "✅ Network egress: ~$5/month"
    echo "✅ Total: ~$63/month (covered by credit)"
    echo
    echo "After credit expires (Always Free):"
    echo "✅ e2-micro instance: $0/month"
    echo "✅ 30GB HDD storage: $1.20/month"
    echo "✅ 5GB Cloud Storage: $0/month"
    echo "✅ Network egress (1GB): $0/month"
    echo "✅ Total: ~$1.20/month"
    echo
    echo "Recommended approach:"
    echo "1. Use credit for development/testing with powerful instances"
    echo "2. Switch to Always Free tier for production"
    echo "3. Use external database (Supabase) to stay in free tier"
}

# Show final instructions
show_final_instructions() {
    print_header "🎉 Google Cloud Setup Complete!"
    
    echo "What you've created:"
    echo "✅ Google Cloud project: $PROJECT_ID"
    echo "✅ Compute Engine instance with external IP"
    echo "✅ Firewall rules for HTTP/HTTPS/SSH"
    echo "✅ Cloud Storage bucket (optional)"
    echo "✅ Cloud SQL database (optional)"
    echo "✅ Deployment scripts"
    echo
    echo "Next steps:"
    echo "1. Configure Supabase credentials in .env.gcp:"
    echo "   export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    echo
    echo "2. Deploy your application:"
    echo "   source .env.gcp"
    echo "   ./deploy-to-gcp.sh"
    echo
    echo "3. Access your application:"
    echo "   http://$EXTERNAL_IP"
    echo
    echo "4. SSH to your instance:"
    echo "   gcloud compute ssh placement-cms-server"
    echo
    echo "Files created:"
    echo "- .env.gcp (GCP configuration)"
    echo "- deploy-to-gcp.sh (Deployment script)"
    echo "- deploy-cloud-run.sh (Cloud Run deployment)"
    echo
    print_warning "Monitor your usage in GCP Console to track credit consumption"
    print_warning "Set up billing alerts to avoid unexpected charges"
}

# Main setup function
main() {
    print_header "☁️ Google Cloud Platform Setup for Placement CMS"
    echo "Setting up enterprise-grade cloud infrastructure with $300 credit..."
    echo
    
    # Check if gcloud is installed, install if not
    if ! check_gcloud_cli; then
        install_gcloud_cli
    fi
    
    setup_gcp_account
    initialize_gcloud
    create_compute_instance
    create_cloud_sql
    create_storage_bucket
    generate_deployment_script
    setup_cloud_run
    show_cost_estimation
    show_final_instructions
    
    print_status "🎯 Google Cloud setup completed successfully!"
}

# Run main function
main "$@"
