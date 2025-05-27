# AWS CLI Setup Guide

This guide will help you set up AWS CLI and create an EC2 key pair for deploying the Placement CMS.

## Prerequisites

- AWS Account with appropriate permissions
- Terminal/Command Prompt access
- Internet connection

## Quick Setup

### 1. Run the Setup Script

\`\`\`bash
# Make the script executable
chmod +x scripts/aws-setup.sh

# Run the setup script
./scripts/aws-setup.sh
\`\`\`

### 2. Manual Setup (Alternative)

If you prefer to set up manually:

#### Install AWS CLI v2

**Linux:**
\`\`\`bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
\`\`\`

**macOS:**
\`\`\`bash
# Using Homebrew
brew install awscli

# Or download installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
\`\`\`

**Windows:**
Download and install from: https://awscli.amazonaws.com/AWSCLIV2.msi

#### Configure AWS CLI

\`\`\`bash
aws configure
\`\`\`

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

#### Create EC2 Key Pair

\`\`\`bash
# Create key pair
aws ec2 create-key-pair \
  --key-name placement-cms-key \
  --query 'KeyMaterial' \
  --output text > placement-cms-key.pem

# Set proper permissions
chmod 400 placement-cms-key.pem
\`\`\`

## Getting AWS Credentials

### 1. Create IAM User (Recommended)

1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Enter username (e.g., "placement-cms-deploy")
4. Select "Programmatic access"
5. Attach policies:
   - `AmazonEC2FullAccess`
   - `CloudFormationFullAccess`
   - `IAMFullAccess`
   - `AmazonS3FullAccess`
6. Download credentials CSV

### 2. Use Root Account (Not Recommended)

1. Go to AWS Console → Account → Security Credentials
2. Create new access key
3. Download credentials

## Required AWS Permissions

Your AWS user needs these permissions:

\`\`\`json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "cloudformation:*",
                "iam:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
\`\`\`

## Verification

Run the verification script to check your setup:

\`\`\`bash
chmod +x scripts/verify-aws-setup.sh
./scripts/verify-aws-setup.sh
\`\`\`

## Common Issues

### 1. Permission Denied Errors

**Problem:** AWS CLI returns permission denied errors

**Solution:**
- Check if your AWS credentials are correct
- Verify your IAM user has the required permissions
- Try running `aws sts get-caller-identity` to test

### 2. Key Pair Already Exists

**Problem:** Error creating key pair because it already exists

**Solution:**
\`\`\`bash
# Delete existing key pair
aws ec2 delete-key-pair --key-name placement-cms-key

# Create new one
aws ec2 create-key-pair --key-name placement-cms-key --query 'KeyMaterial' --output text > placement-cms-key.pem
\`\`\`

### 3. Wrong Permissions on Key File

**Problem:** SSH connection fails due to key permissions

**Solution:**
\`\`\`bash
chmod 400 placement-cms-key.pem
\`\`\`

### 4. AWS CLI v1 vs v2

**Problem:** Old AWS CLI version causing issues

**Solution:**
\`\`\`bash
# Check version
aws --version

# Upgrade to v2 (Linux/macOS)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install --update
\`\`\`

## Security Best Practices

1. **Use IAM Users:** Don't use root account credentials
2. **Least Privilege:** Only grant necessary permissions
3. **Rotate Keys:** Regularly rotate access keys
4. **Secure Storage:** Never commit credentials to version control
5. **MFA:** Enable multi-factor authentication on your AWS account

## Next Steps

After completing the AWS CLI setup:

1. **Configure Supabase:** Update `.env.aws` with your Supabase credentials
2. **Deploy Infrastructure:** Use CloudFormation template
3. **Deploy Application:** Run the deployment script
4. **Configure Domain:** Set up custom domain and SSL

## Environment Variables

The setup script creates `.env.aws` with these variables:

\`\`\`bash
# AWS Configuration
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export EC2_KEY_NAME=placement-cms-key

# Deployment Configuration
export STACK_NAME=placement-cms
export INSTANCE_TYPE=t3.medium

# Application Configuration (update these)
export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

Remember to source this file before deployment:
\`\`\`bash
source .env.aws
