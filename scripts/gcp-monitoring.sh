#!/bin/bash

# Google Cloud Platform Monitoring Script
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Load environment
if [ -f .env.gcp ]; then
    source .env.gcp
else
    print_error ".env.gcp file not found"
    exit 1
fi

# Check instance status
check_instance_status() {
    print_header "Instance Status"
    
    status=$(gcloud compute instances describe $GCP_INSTANCE_NAME \
        --zone=$GCP_ZONE \
        --format='value(status)')
    
    if [ "$status" = "RUNNING" ]; then
        print_status "✅ Instance is running"
    else
        print_error "❌ Instance status: $status"
    fi
    
    # Get instance details
    gcloud compute instances describe $GCP_INSTANCE_NAME \
        --zone=$GCP_ZONE \
        --format='table(name,machineType.basename(),status,networkInterfaces[0].accessConfigs[0].natIP:label=EXTERNAL_IP)'
}

# Check application health
check_application_health() {
    print_header "Application Health"
    
    if curl -f -s http://$GCP_EXTERNAL_IP > /dev/null; then
        print_status "✅ Application is responding"
    else
        print_error "❌ Application is not responding"
    fi
    
    # Check via SSH
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="
        echo 'Checking PM2 status:'
        pm2 status
        echo
        echo 'Checking nginx status:'
        sudo systemctl status nginx --no-pager -l
    " 2>/dev/null || print_warning "Could not connect via SSH"
}

# Check resource usage
check_resource_usage() {
    print_header "Resource Usage"
    
    # Get CPU and memory usage
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="
        echo 'CPU and Memory Usage:'
        top -bn1 | head -5
        echo
        echo 'Disk Usage:'
        df -h /
        echo
        echo 'Memory Details:'
        free -h
    " 2>/dev/null || print_warning "Could not get resource usage"
}

# Check billing and costs
check_billing() {
    print_header "Billing Information"
    
    # Get current month's usage
    current_month=$(date +%Y-%m)
    
    print_status "Checking billing for project: $GCP_PROJECT_ID"
    
    # Note: Billing API requires special permissions
    echo "To check detailed billing:"
    echo "1. Go to: https://console.cloud.google.com/billing"
    echo "2. Select your project: $GCP_PROJECT_ID"
    echo "3. View current month usage and remaining credit"
    
    # Show estimated costs
    echo
    echo "Estimated monthly costs:"
    case $GCP_MACHINE_TYPE in
        "e2-micro")
            echo "- Compute: $0/month (Always Free)"
            ;;
        "e2-small")
            echo "- Compute: ~$13/month"
            ;;
        "e2-medium")
            echo "- Compute: ~$25/month"
            ;;
        "e2-standard-2")
            echo "- Compute: ~$50/month"
            ;;
    esac
    echo "- Storage (30GB): ~$1.20/month"
    echo "- Network egress: ~$5/month"
}

# Check logs
check_logs() {
    print_header "Recent Logs"
    
    echo "Application logs (via SSH):"
    gcloud compute ssh $GCP_INSTANCE_NAME --zone=$GCP_ZONE --command="
        pm2 logs placement-cms --lines 10 --nostream
    " 2>/dev/null || print_warning "Could not get application logs"
    
    echo
    echo "System logs:"
    gcloud logging read "resource.type=gce_instance AND resource.labels.instance_id=$GCP_INSTANCE_NAME" \
        --limit=5 \
        --format='table(timestamp,severity,textPayload)' || print_warning "Could not get system logs"
}

# Performance recommendations
performance_recommendations() {
    print_header "Performance Recommendations"
    
    echo "Cost optimization tips:"
    echo "1. Use e2-micro instance for Always Free tier"
    echo "2. Use preemptible instances for development (60-91% discount)"
    echo "3. Set up auto-scaling for variable workloads"
    echo "4. Use Cloud CDN for static content"
    echo "5. Enable compression in nginx"
    echo
    echo "Performance tips:"
    echo "1. Use SSD persistent disks for better I/O"
    echo "2. Enable HTTP/2 in nginx"
    echo "3. Use Cloud Load Balancer for high availability"
    echo "4. Consider Cloud Run for serverless scaling"
    echo "5. Use Cloud SQL for managed database"
}

# Setup monitoring alerts
setup_monitoring() {
    print_header "Setting up Monitoring Alerts"
    
    read -p "Do you want to setup monitoring alerts? (y/N): " setup_alerts
    if [[ ! $setup_alerts =~ ^[Yy]$ ]]; then
        return
    fi
    
    # Create notification channel (email)
    read -p "Enter email for alerts: " alert_email
    
    gcloud alpha monitoring channels create \
        --display-name="Email Notifications" \
        --type=email \
        --channel-labels=email_address=$alert_email
    
    # Create CPU usage alert
    gcloud alpha monitoring policies create \
        --policy-from-file=- << EOF
displayName: "High CPU Usage"
conditions:
  - displayName: "CPU usage above 80%"
    conditionThreshold:
      filter: 'resource.type="gce_instance" AND resource.label.instance_id="$GCP_INSTANCE_NAME"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.8
      duration: 300s
alertStrategy:
  autoClose: 86400s
notificationChannels:
  - projects/$GCP_PROJECT_ID/notificationChannels/[CHANNEL_ID]
EOF
    
    print_status "✅ Monitoring alerts configured"
}

# Main monitoring function
main() {
    echo "📊 Google Cloud Platform Monitoring"
    echo "===================================="
    echo
    
    check_instance_status
    echo
    check_application_health
    echo
    check_resource_usage
    echo
    check_billing
    echo
    check_logs
    echo
    performance_recommendations
    echo
    setup_monitoring
    
    print_status "🎯 Monitoring completed!"
    print_status "Access GCP Console: https://console.cloud.google.com"
}

# Run main function
main "$@"
