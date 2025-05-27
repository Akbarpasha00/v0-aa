#!/bin/bash

# Oracle Cloud Instance Monitoring Script
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
    echo -e "${BLUE}[MONITOR]${NC} $1"
}

# System monitoring
check_system_resources() {
    print_header "System Resources"
    
    # CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    echo "CPU Usage: ${cpu_usage}%"
    
    # Memory usage
    memory_info=$(free -h | grep '^Mem:')
    echo "Memory: $memory_info"
    
    # Disk usage
    disk_usage=$(df -h / | awk 'NR==2{printf "%s", $5}')
    echo "Disk Usage: $disk_usage"
    
    # Load average
    load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo "Load Average:$load_avg"
    
    echo
}

# Application monitoring
check_application() {
    print_header "Application Status"
    
    # Check if PM2 is running
    if command -v pm2 &> /dev/null; then
        echo "PM2 Status:"
        pm2 status
        echo
        
        # Check application logs
        echo "Recent Application Logs:"
        pm2 logs placement-cms --lines 10 --nostream
    else
        print_warning "PM2 not found"
    fi
    
    # Check if application is responding
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_status "✅ Application is responding"
    else
        print_error "❌ Application is not responding"
    fi
    
    echo
}

# Docker monitoring
check_docker() {
    print_header "Docker Status"
    
    if command -v docker &> /dev/null; then
        echo "Docker Containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo
        
        echo "Docker Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    else
        print_warning "Docker not found"
    fi
    
    echo
}

# Network monitoring
check_network() {
    print_header "Network Status"
    
    # Check listening ports
    echo "Listening Ports:"
    netstat -tlnp | grep -E ':(80|443|3000|22)\s'
    echo
    
    # Check nginx status
    if systemctl is-active --quiet nginx; then
        print_status "✅ Nginx is running"
    else
        print_error "❌ Nginx is not running"
    fi
    
    # Test external connectivity
    if ping -c 1 google.com &> /dev/null; then
        print_status "✅ Internet connectivity OK"
    else
        print_error "❌ No internet connectivity"
    fi
    
    echo
}

# Security monitoring
check_security() {
    print_header "Security Status"
    
    # Check failed login attempts
    echo "Recent Failed SSH Attempts:"
    grep "Failed password" /var/log/auth.log | tail -5 || echo "No recent failed attempts"
    echo
    
    # Check firewall status
    if command -v ufw &> /dev/null; then
        echo "UFW Status:"
        sudo ufw status
    fi
    
    # Check for updates
    echo "Available Updates:"
    apt list --upgradable 2>/dev/null | wc -l
    echo
}

# Performance recommendations
performance_recommendations() {
    print_header "Performance Recommendations"
    
    # Check CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' | cut -d'.' -f1)
    if [ "$cpu_usage" -gt 80 ]; then
        print_warning "High CPU usage detected. Consider optimizing your application."
    fi
    
    # Check memory usage
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$memory_usage" -gt 80 ]; then
        print_warning "High memory usage detected. Consider adding swap or optimizing memory usage."
    fi
    
    # Check disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        print_warning "High disk usage detected. Consider cleaning up logs or adding storage."
    fi
    
    echo "Optimization tips:"
    echo "- Enable gzip compression in nginx"
    echo "- Use PM2 cluster mode for better CPU utilization"
    echo "- Set up log rotation to save disk space"
    echo "- Monitor application performance with PM2 monitoring"
    echo
}

# Generate report
generate_report() {
    print_header "System Report Generated: $(date)"
    
    {
        echo "=== Oracle Cloud Instance Report ==="
        echo "Generated: $(date)"
        echo "Hostname: $(hostname)"
        echo "Uptime: $(uptime)"
        echo
        
        check_system_resources
        check_application
        check_docker
        check_network
        check_security
        performance_recommendations
    } > "/tmp/oracle-cloud-report-$(date +%Y%m%d-%H%M%S).txt"
    
    print_status "Report saved to /tmp/oracle-cloud-report-$(date +%Y%m%d-%H%M%S).txt"
}

# Main monitoring function
main() {
    echo "🔍 Oracle Cloud Instance Monitoring"
    echo "===================================="
    echo
    
    check_system_resources
    check_application
    check_docker
    check_network
    check_security
    performance_recommendations
    
    read -p "Generate detailed report? (y/N): " generate
    if [[ $generate =~ ^[Yy]$ ]]; then
        generate_report
    fi
    
    print_status "🎯 Monitoring completed!"
}

# Run main function
main "$@"
