#!/bin/bash

# AWS Setup Verification Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Check AWS CLI installation
check_aws_cli() {
    print_header "Checking AWS CLI installation..."
    
    if command -v aws &> /dev/null; then
        version=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
        if [[ $version == 2.* ]]; then
            print_status "AWS CLI v$version is installed"
        else
            print_warning "AWS CLI v$version detected (v2 recommended)"
        fi
    else
        print_error "AWS CLI is not installed"
        return 1
    fi
}

# Check AWS configuration
check_aws_config() {
    print_header "Checking AWS configuration..."
    
    if aws sts get-caller-identity &> /dev/null; then
        user_arn=$(aws sts get-caller-identity --query 'Arn' --output text)
        account_id=$(aws sts get-caller-identity --query 'Account' --output text)
        region=$(aws configure get region)
        
        print_status "AWS CLI is configured"
        print_status "User: $user_arn"
        print_status "Account: $account_id"
        print_status "Region: $region"
    else
        print_error "AWS CLI is not configured or credentials are invalid"
        return 1
    fi
}

# Check EC2 permissions
check_ec2_permissions() {
    print_header "Checking EC2 permissions..."
    
    # Test EC2 describe permissions
    if aws ec2 describe-regions --region us-east-1 &> /dev/null; then
        print_status "EC2 describe permissions: OK"
    else
        print_error "EC2 describe permissions: FAILED"
    fi
    
    # Test key pair permissions
    if aws ec2 describe-key-pairs &> /dev/null; then
        print_status "EC2 key pair permissions: OK"
    else
        print_error "EC2 key pair permissions: FAILED"
    fi
    
    # Test instance permissions
    if aws ec2 describe-instances &> /dev/null; then
        print_status "EC2 instance permissions: OK"
    else
        print_error "EC2 instance permissions: FAILED"
    fi
}

# Check CloudFormation permissions
check_cloudformation_permissions() {
    print_header "Checking CloudFormation permissions..."
    
    if aws cloudformation list-stacks &> /dev/null; then
        print_status "CloudFormation permissions: OK"
    else
        print_error "CloudFormation permissions: FAILED"
    fi
}

# Check IAM permissions
check_iam_permissions() {
    print_header "Checking IAM permissions..."
    
    if aws iam get-user &> /dev/null; then
        print_status "IAM user permissions: OK"
    else
        print_warning "IAM user permissions: LIMITED (may affect some operations)"
    fi
}

# Check key pair files
check_key_files() {
    print_header "Checking EC2 key pair files..."
    
    key_files=(*.pem)
    if [ -f "${key_files[0]}" ]; then
        for key_file in *.pem; do
            if [ -f "$key_file" ]; then
                permissions=$(stat -c "%a" "$key_file" 2>/dev/null || stat -f "%A" "$key_file" 2>/dev/null)
                if [ "$permissions" = "400" ]; then
                    print_status "Key file: $key_file (permissions: $permissions)"
                else
                    print_warning "Key file: $key_file (permissions: $permissions - should be 400)"
                    echo "  Fix with: chmod 400 $key_file"
                fi
            fi
        done
    else
        print_error "No EC2 key pair files found (*.pem)"
    fi
}

# Check environment file
check_environment() {
    print_header "Checking environment configuration..."
    
    if [ -f ".env.aws" ]; then
        print_status "Environment file (.env.aws) exists"
        
        # Check if required variables are set
        source .env.aws
        
        required_vars=("AWS_REGION" "EC2_KEY_NAME")
        for var in "${required_vars[@]}"; do
            if [ -n "${!var}" ]; then
                print_status "$var is set: ${!var}"
            else
                print_error "$var is not set in .env.aws"
            fi
        done
        
        # Check Supabase configuration
        if [ "$NEXT_PUBLIC_SUPABASE_URL" = "your-supabase-url" ]; then
            print_warning "Supabase URL needs to be configured in .env.aws"
        else
            print_status "Supabase URL is configured"
        fi
    else
        print_error "Environment file (.env.aws) not found"
    fi
}

# Test deployment readiness
test_deployment_readiness() {
    print_header "Testing deployment readiness..."
    
    # Check if CloudFormation template exists
    if [ -f "aws/cloudformation-template.yaml" ]; then
        print_status "CloudFormation template found"
        
        # Validate template
        if aws cloudformation validate-template --template-body file://aws/cloudformation-template.yaml &> /dev/null; then
            print_status "CloudFormation template is valid"
        else
            print_error "CloudFormation template validation failed"
        fi
    else
        print_error "CloudFormation template not found (aws/cloudformation-template.yaml)"
    fi
    
    # Check if deployment script exists
    if [ -f "deploy.sh" ]; then
        if [ -x "deploy.sh" ]; then
            print_status "Deployment script is executable"
        else
            print_warning "Deployment script exists but is not executable"
            echo "  Fix with: chmod +x deploy.sh"
        fi
    else
        print_error "Deployment script not found (deploy.sh)"
    fi
}

# Generate deployment commands
generate_deployment_commands() {
    print_header "Deployment Commands:"
    
    if [ -f ".env.aws" ]; then
        source .env.aws
        
        echo
        echo "1. Deploy with CloudFormation:"
        echo "   aws cloudformation create-stack \\"
        echo "     --stack-name ${STACK_NAME:-placement-cms} \\"
        echo "     --template-body file://aws/cloudformation-template.yaml \\"
        echo "     --parameters ParameterKey=KeyPairName,ParameterValue=${EC2_KEY_NAME:-placement-cms-key} \\"
        echo "                  ParameterKey=InstanceType,ParameterValue=${INSTANCE_TYPE:-t3.medium} \\"
        echo "     --capabilities CAPABILITY_IAM"
        echo
        echo "2. Check deployment status:"
        echo "   aws cloudformation describe-stacks --stack-name ${STACK_NAME:-placement-cms}"
        echo
        echo "3. Get instance IP:"
        echo "   aws cloudformation describe-stacks \\"
        echo "     --stack-name ${STACK_NAME:-placement-cms} \\"
        echo "     --query 'Stacks[0].Outputs[?OutputKey==\`PublicIP\`].OutputValue' \\"
        echo "     --output text"
    fi
}

# Main verification function
main() {
    echo "🔍 AWS Setup Verification for Placement CMS"
    echo "=============================================="
    echo
    
    # Run all checks
    check_aws_cli
    check_aws_config
    check_ec2_permissions
    check_cloudformation_permissions
    check_iam_permissions
    check_key_files
    check_environment
    test_deployment_readiness
    
    echo
    generate_deployment_commands
    
    echo
    echo "🎯 Verification completed!"
    echo "If all checks passed, you're ready to deploy your Placement CMS to AWS EC2."
}

# Run main function
main "$@"
