#!/bin/bash

# EC2 Instance Setup Script
set -e

echo "🔧 Setting up EC2 instance for Placement CMS..."

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install essential packages
sudo apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash placement
sudo usermod -aG sudo placement

# Setup application directory
sudo mkdir -p /var/www/placement-cms
sudo chown placement:placement /var/www/placement-cms

# Configure log rotation
sudo tee /etc/logrotate.d/placement-cms << EOF
/var/log/placement-cms/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 placement placement
    postrotate
        systemctl reload nginx
    endscript
}
EOF

echo "✅ EC2 instance setup completed!"
echo "Next steps:"
echo "1. Configure your domain DNS to point to this EC2 instance"
echo "2. Run the deployment script from your local machine"
echo "3. Setup SSL certificates with Let's Encrypt"
