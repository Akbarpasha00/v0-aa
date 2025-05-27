# AWS EC2 Deployment Guide

This guide will help you deploy the Placement CMS application to AWS EC2.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured
3. EC2 Key Pair created
4. Domain name (optional but recommended)
5. Supabase project set up

## Quick Deployment

### Option 1: Using CloudFormation (Recommended)

1. **Deploy the infrastructure:**
   \`\`\`bash
   aws cloudformation create-stack \
     --stack-name placement-cms \
     --template-body file://aws/cloudformation-template.yaml \
     --parameters ParameterKey=KeyPairName,ParameterValue=your-key-pair \
                  ParameterKey=InstanceType,ParameterValue=t3.medium \
     --capabilities CAPABILITY_IAM
   \`\`\`

2. **Wait for stack creation:**
   \`\`\`bash
   aws cloudformation wait stack-create-complete --stack-name placement-cms
   \`\`\`

3. **Get the public IP:**
   \`\`\`bash
   aws cloudformation describe-stacks \
     --stack-name placement-cms \
     --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
     --output text
   \`\`\`

### Option 2: Manual Deployment

1. **Set environment variables:**
   \`\`\`bash
   export EC2_HOST=your-ec2-public-ip
   export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   \`\`\`

2. **Run the deployment script:**
   \`\`\`bash
   chmod +x deploy.sh
   ./deploy.sh
   \`\`\`

## Configuration

### Environment Variables

Create a `.env.production` file with:

\`\`\`env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### SSL Certificate Setup

For production, replace the self-signed certificate with a real one:

\`\`\`bash
# Using Let's Encrypt
sudo certbot --nginx -d your-domain.com
\`\`\`

### Database Setup

1. Create the required tables in Supabase
2. Run the SQL scripts provided in the previous conversation
3. Configure Row Level Security (RLS) policies

## Monitoring and Maintenance

### Application Logs
\`\`\`bash
# View application logs
sudo docker-compose logs -f placement-cms

# View nginx logs
sudo docker-compose logs -f nginx
\`\`\`

### System Monitoring
\`\`\`bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
\`\`\`

### Backup Strategy

1. **Database backups:** Supabase handles this automatically
2. **File uploads:** Stored in S3 bucket (if configured)
3. **Application backups:** Created automatically during deployment

## Security Considerations

1. **Firewall:** Only ports 22, 80, and 443 are open
2. **SSL/TLS:** HTTPS enforced with security headers
3. **Rate limiting:** Configured in nginx
4. **Fail2ban:** Protects against brute force attacks
5. **Regular updates:** Keep system and dependencies updated

## Scaling

### Vertical Scaling
- Upgrade EC2 instance type
- Increase memory/CPU allocation

### Horizontal Scaling
- Use Application Load Balancer
- Deploy multiple EC2 instances
- Configure auto-scaling groups

## Troubleshooting

### Common Issues

1. **Application not starting:**
   \`\`\`bash
   sudo docker-compose logs placement-cms
   \`\`\`

2. **SSL certificate issues:**
   \`\`\`bash
   sudo nginx -t
   sudo systemctl reload nginx
   \`\`\`

3. **Database connection issues:**
   - Check Supabase URL and keys
   - Verify network connectivity

### Health Checks

\`\`\`bash
# Check application health
curl -f http://localhost:3000/api/health

# Check nginx status
sudo systemctl status nginx

# Check Docker containers
sudo docker-compose ps
\`\`\`

## Cost Optimization

1. **Instance sizing:** Start with t3.medium, scale as needed
2. **Reserved instances:** For long-term deployments
3. **Spot instances:** For development environments
4. **S3 lifecycle policies:** For file storage optimization

## Support

For issues related to:
- AWS infrastructure: Check CloudFormation events
- Application errors: Check application logs
- Database issues: Check Supabase dashboard
- SSL/Domain issues: Check DNS and certificate configuration
