#!/bin/bash

# Google Cloud Cost Optimization Script
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
    echo -e "${YELLOW}[TIP]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[OPTIMIZE]${NC} $1"
}

# Load environment
source .env.gcp

# Switch to Always Free tier
switch_to_free_tier() {
    print_header "Switching to Always Free Tier"
    
    print_status "Current instance: $GCP_MACHINE_TYPE"
    
    if [ "$GCP_MACHINE_TYPE" != "e2-micro" ]; then
        print_warning "Switching to e2-micro for Always Free tier"
        
        # Stop current instance
        gcloud compute instances stop $GCP_INSTANCE_NAME --zone=$GCP_ZONE
        
        # Change machine type
        gcloud compute instances set-machine-type $GCP_INSTANCE_NAME \
            --zone=$GCP_ZONE \
            --machine-type=e2-micro
        
        # Start instance
        gcloud compute instances start $GCP_INSTANCE_NAME --zone=$GCP_ZONE
        
        print_status "✅ Switched to e2-micro (Always Free)"
        
        # Update environment file
        sed -i 's/GCP_MACHINE_TYPE=.*/GCP_MACHINE_TYPE=e2-micro/' .env.gcp
    else
        print_status "Already using e2-micro (Always Free)"
    fi
}

# Optimize storage
optimize_storage() {
    print_header "Storage Optimization"
    
    # Check current disk usage
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="
        echo 'Current disk usage:'
        df -h /
        echo
        echo 'Cleaning up:'
        sudo apt-get autoremove -y
        sudo apt-get autoclean
        docker system prune -f
        npm cache clean --force
        echo
        echo 'After cleanup:'
        df -h /
    "
    
    print_status "✅ Storage optimized"
}

# Setup preemptible instance for development
create_preemptible_dev() {
    print_header "Creating Preemptible Development Instance"
    
    read -p "Create a preemptible instance for development? (y/N): " create_preempt
    if [[ ! $create_preempt =~ ^[Yy]$ ]]; then
        return
    fi
    
    gcloud compute instances create placement-cms-dev \
        --machine-type=e2-standard-2 \
        --preemptible \
        --image-family=ubuntu-2004-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=30GB \
        --zone=$GCP_ZONE \
        --tags=http-server,https-server
    
    print_status "✅ Preemptible dev instance created (60-91% cheaper)"
    print_warning "Preemptible instances can be terminated at any time"
}

# Setup billing alerts
setup_billing_alerts() {
    print_header "Setting up Billing Alerts"
    
    read -p "Setup billing alerts? (y/N): " setup_alerts
    if [[ ! $setup_alerts =~ ^[Yy]$ ]]; then
        return
    fi
    
    read -p "Enter monthly budget limit ($): " budget_limit
    budget_limit=${budget_limit:-50}
    
    # Create budget (requires billing account access)
    echo "To setup billing alerts:"
    echo "1. Go to: https://console.cloud.google.com/billing/budgets"
    echo "2. Create budget with limit: \$$budget_limit"
    echo "3. Set alerts at 50%, 90%, and 100%"
    echo "4. Add email notifications"
    
    print_status "Billing alert instructions provided"
}

# Show cost optimization tips
show_optimization_tips() {
    print_header "💰 Cost Optimization Tips"
    
    echo "Always Free Tier (No charges):"
    echo "✅ e2-micro instance (1 vCPU, 1GB RAM)"
    echo "✅ 30GB HDD storage"
    echo "✅ 1GB network egress per month"
    echo "✅ Cloud Functions (2M invocations)"
    echo "✅ Cloud Storage (5GB)"
    echo
    echo "Development optimizations:"
    echo "💡 Use preemptible instances (60-91% discount)"
    echo "💡 Stop instances when not in use"
    echo "💡 Use Cloud Shell for development"
    echo "💡 Use Cloud Run for serverless scaling"
    echo
    echo "Production optimizations:"
    echo "💡 Use sustained use discounts (automatic)"
    echo "💡 Use committed use contracts (57% discount)"
    echo "💡 Right-size your instances"
    echo "💡 Use regional persistent disks"
    echo
    echo "Monitoring:"
    echo "📊 Set up billing alerts"
    echo "📊 Use Cloud Monitoring for resource usage"
    echo "📊 Review billing reports monthly"
}

# Main optimization function
main() {
    echo "💰 Google Cloud Cost Optimization"
    echo "=================================="
    echo
    
    switch_to_free_tier
    echo
    optimize_storage
    echo
    create_preemptible_dev
    echo
    setup_billing_alerts
    echo
    show_optimization_tips
    
    print_status "🎯 Cost optimization completed!"
}

# Run main function
main "$@"
