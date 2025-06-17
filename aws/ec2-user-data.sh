#!/bin/bash

# EC2 User Data Script for Placement CMS
yum update -y

# Install Docker
yum install -y docker
service docker start
usermod -a -G docker ec2-user
chkconfig docker on

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Create application directory
mkdir -p /home/ec2-user/placement-cms
chown ec2-user:ec2-user /home/ec2-user/placement-cms

# Create log directory
mkdir -p /var/log/placement-cms
chown ec2-user:ec2-user /var/log/placement-cms

# Install PM2 globally
npm install -g pm2

# Setup log rotation
cat > /etc/logrotate.d/placement-cms << EOF
/var/log/placement-cms/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
EOF

# Create systemd service for the application
cat > /etc/systemd/system/placement-cms.service << EOF
[Unit]
Description=Placement CMS Application
After=network.target

[Service]
Type=forking
User=ec2-user
WorkingDirectory=/home/ec2-user/placement-cms
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable placement-cms

echo "EC2 instance setup completed!"
