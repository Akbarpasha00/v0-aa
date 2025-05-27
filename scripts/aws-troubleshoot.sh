#!/bin/bash

# AWS Troubleshooting Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Diagnose AWS CLI issues
diagnose_aws_cli() {
    print_header "AWS CLI Diagnosis"
    
    # Check if AWS CLI is installed
    if command -v aws &> /dev/null; then
        version=$(aws --version 2>&1)
        print_status "AWS CLI installed: $version"
    else
        print_error "AWS CLI is not installed"
        print_status "Install with: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
        return 1
    fi
    
    # Check configuration
    if aws configure list &> /dev/null; then
        print_status "AWS CLI configuration:"
        aws configure list
    else
        print_error "AWS CLI is not configured"
        print_status "Configure with: aws configure"
        return 1
    fi
    
    # Test credentials
    if aws sts get-caller-identity &> /dev/null; then
        print_status "Credentials are valid"
        aws sts get-caller-identity
    else
        print_error "Invalid credentials"
        print_status "Reconfigure with: aws configure"
        return 1
    fi
}

# Diagnose EC2 key pair issues
diagnose_key_pairs() {
    print_header "EC2 Key Pair Diagnosis"
    
    # List key pairs in AWS
    print_status "Key pairs in AWS:"
    if aws ec2 describe-key-pairs --query 'KeyPairs[*].[KeyName,KeyFingerprint]' --output table 2>/dev/null; then
        echo
    else
        print_error "Failed to list key pairs"
        return 1
    fi
    
    # Check local key files
    print_status "Local key files:"
    if ls *.pem 2>/dev/null; then
        for key_file in *.pem; do
            if [ -f "$key_file" ]; then
                perms=$(stat -c "%a" "$key_file" 2>/dev/null || stat -f "%A" "$key_file" 2>/dev/null)
                if [ "$perms" = "400" ]; then
                    print_status "$key_file (permissions: $perms) ✓"
                else
                    print_warning "$key_file (permissions: $perms) - should be 400"
                    echo "  Fix with: chmod 400 $key_file"
                fi
            fi
        done
    else
        print_warning "No .pem files found in current directory"
    fi
}

# Diagnose permissions
diagnose_permissions() {
    print_header "AWS Permissions Diagnosis"
    
    # Test various AWS services
    services=(
        "ec2:describe-regions"
        "ec2:describe-key-pairs"
        "ec2:describe-instances"
        "cloudformation:list-stacks"
        "iam:get-user"
        "s3:list-buckets"
    )
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d: -f1)
        action=$(echo $service | cut -d: -f2)
        
        case $service in
            "ec2:describe-regions")
                if aws ec2 describe-regions --region us-east-1 &> /dev/null; then
                    print_status "✓ EC2 describe permissions"
                else
                    print_error "✗ EC2 describe permissions"
                fi
                ;;
            "ec2:describe-key-pairs")
                if aws ec2 describe-key-pairs &> /dev/null; then
                    print_status "✓ EC2 key pair permissions"
                else
                    print_error "✗ EC2 key pair permissions"
                fi
                ;;
            "ec2:describe-instances")
                if aws ec2 describe-instances &> /dev/null; then
                    print_status "✓ EC2 instance permissions"
                else
                    print_error "✗ EC2 instance permissions"
                fi
                ;;
            "cloudformation:list-stacks")
                if aws cloudformation list-stacks &> /dev/null; then
                    print_status "✓ CloudFormation permissions"
                else
                    print_error "✗ CloudFormation permissions"
                fi
                ;;
            "iam:get-user")
                if aws iam get-user &> /dev/null; then
                    print_status "✓ IAM user permissions"
                else
                    print_warning "✗ IAM user permissions (may be limited)"
                fi
                ;;
            "s3:list-buckets")
                if aws s3 ls &> /dev/null; then
                    print_status "✓ S3 permissions"
                else
                    print_error "✗ S3 permissions"
                fi
                ;;
        esac
    done
}

# Check network connectivity
check_connectivity() {
    print_header "Network Connectivity Check"
    
    endpoints=(
        "https://aws.amazon.com"
        "https://ec2.amazonaws.com"
        "https://cloudformation.amazonaws.com"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s --max-time 5 "$endpoint" > /dev/null; then
            print_status "✓ $endpoint"
        else
            print_error "✗ $endpoint"
        fi
    done
}

# Generate fix commands
generate_fixes() {
    print_header "Common Fixes"
    
    echo "1. Reinstall AWS CLI v2:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip && sudo ./aws/install --update"
    echo
    
    echo "2. Reconfigure AWS CLI:"
    echo "   aws configure"
    echo
    
    echo "3. Create new key pair:"
    echo "   aws ec2 create-key-pair --key-name placement-cms-key --query 'KeyMaterial' --output text > placement-cms-key.pem"
    echo "   chmod 400 placement-cms-key.pem"
    echo
    
    echo "4. Fix key permissions:"
    echo "   chmod 400 *.pem"
    echo
    
    echo "5. Test configuration:"
    echo "   aws sts get-caller-identity"
    echo
}

# Main function
main() {
    echo "🔧 AWS Troubleshooting Tool"
    echo "=========================="
    echo
    
    diagnose_aws_cli
    echo
    diagnose_key_pairs
    echo
    diagnose_permissions
    echo
    check_connectivity
    echo
    generate_fixes
    
    echo "🎯 Troubleshooting completed!"
}

main "$@"
