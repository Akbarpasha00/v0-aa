#!/bin/bash

# AWS EC2 Deployment Script for Placement CMS
set -e

echo "🚀 Starting deployment to AWS EC2..."

# Configuration
APP_NAME="placement-cms"
DEPLOY_USER="ubuntu"
EC2_HOST="${EC2_HOST:-your-ec2-instance.amazonaws.com}"
DEPLOY_PATH="/home/$DEPLOY_USER/$APP_NAME"
BACKUP_PATH="/home/$DEPLOY_USER/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("EC2_HOST" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Environment variable $var is not set"
            exit 1
        fi
    done
    
    print_status "All required environment variables are set ✓"
}

# Create backup of current deployment
create_backup() {
    print_status "Creating backup of current deployment..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        if [ -d $DEPLOY_PATH ]; then
            sudo mkdir -p $BACKUP_PATH
            sudo cp -r $DEPLOY_PATH $BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)
            echo 'Backup created successfully'
        else
            echo 'No existing deployment found, skipping backup'
        fi
    "
}

# Install Docker and Docker Compose on EC2
install_docker() {
    print_status "Installing Docker and Docker Compose on EC2..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        # Update system
        sudo apt-get update
        
        # Install Docker
        if ! command -v docker &> /dev/null; then
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            sudo usermod -aG docker $DEPLOY_USER
            echo 'Docker installed successfully'
        else
            echo 'Docker already installed'
        fi
        
        # Install Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
            echo 'Docker Compose installed successfully'
        else
            echo 'Docker Compose already installed'
        fi
    "
}

# Deploy application files
deploy_files() {
    print_status "Deploying application files..."
    
    # Create deployment directory
    ssh $DEPLOY_USER@$EC2_HOST "sudo mkdir -p $DEPLOY_PATH && sudo chown $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH"
    
    # Copy application files
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' ./ $DEPLOY_USER@$EC2_HOST:$DEPLOY_PATH/
    
    print_status "Files deployed successfully ✓"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        cd $DEPLOY_PATH
        cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
EOF
        echo 'Environment variables configured ✓'
    "
}

# Generate SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        cd $DEPLOY_PATH
        sudo mkdir -p ssl
        
        # Generate self-signed certificate (replace with real certificate in production)
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj '/C=US/ST=State/L=City/O=Organization/CN=$EC2_HOST'
        
        echo 'SSL certificates generated ✓'
    "
}

# Start application
start_application() {
    print_status "Starting application..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        cd $DEPLOY_PATH
        
        # Stop existing containers
        sudo docker-compose down || true
        
        # Build and start new containers
        sudo docker-compose up -d --build
        
        # Wait for application to start
        sleep 30
        
        # Check if containers are running
        if sudo docker-compose ps | grep -q 'Up'; then
            echo 'Application started successfully ✓'
        else
            echo 'Failed to start application ✗'
            sudo docker-compose logs
            exit 1
        fi
    "
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    ssh $DEPLOY_USER@$EC2_HOST "
        # Install htop for system monitoring
        sudo apt-get install -y htop
        
        # Create log rotation for Docker logs
        sudo tee /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
        
        echo 'Monitoring setup completed ✓'
    "
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for application to be ready
    sleep 10
    
    # Check if application is responding
    if curl -f -s "http://$EC2_HOST" > /dev/null; then
        print_status "Health check passed ✓"
        print_status "Application is available at: http://$EC2_HOST"
    else
        print_warning "Health check failed - application may still be starting"
        print_status "Check logs with: ssh $DEPLOY_USER@$EC2_HOST 'cd $DEPLOY_PATH && sudo docker-compose logs'"
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    check_env_vars
    create_backup
    install_docker
    deploy_files
    setup_environment
    setup_ssl
    start_application
    setup_monitoring
    health_check
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Your Placement CMS is now running on AWS EC2"
    print_status "Access your application at: https://$EC2_HOST"
}

# Run main function
main "$@"
