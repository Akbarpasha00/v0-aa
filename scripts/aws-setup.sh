#!/bin/bash

# AWS CLI Configuration and EC2 Key Pair Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_status "Detected Linux OS ✓"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_status "Detected macOS ✓"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        print_status "Detected Windows (Git Bash/Cygwin) ✓"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Install AWS CLI v2
install_aws_cli() {
    print_header "Installing AWS CLI v2..."
    
    # Check if AWS CLI is already installed
    if command -v aws &> /dev/null; then
        current_version=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
        print_status "AWS CLI is already installed (version: $current_version)"
        
        # Check if it's version 2
        if [[ $current_version == 2.* ]]; then
            print_status "AWS CLI v2 is already installed ✓"
            return 0
        else
            print_warning "AWS CLI v1 detected. Upgrading to v2..."
        fi
    fi
    
    case $OS in
        "linux")
            print_status "Installing AWS CLI v2 for Linux..."
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip -q awscliv2.zip
            sudo ./aws/install --update
            rm -rf awscliv2.zip aws/
            ;;
        "macos")
            print_status "Installing AWS CLI v2 for macOS..."
            if command -v brew &> /dev/null; then
                brew install awscli
            else
                curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
                sudo installer -pkg AWSCLIV2.pkg -target /
                rm AWSCLIV2.pkg
            fi
            ;;
        "windows")
            print_status "For Windows, please download and install AWS CLI v2 from:"
            print_status "https://awscli.amazonaws.com/AWSCLIV2.msi"
            print_warning "After installation, restart your terminal and run this script again."
            exit 1
            ;;
    esac
    
    # Verify installation
    if command -v aws &> /dev/null; then
        version=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
        print_status "AWS CLI v$version installed successfully ✓"
    else
        print_error "AWS CLI installation failed"
        exit 1
    fi
}

# Configure AWS CLI
configure_aws_cli() {
    print_header "Configuring AWS CLI..."
    
    # Check if AWS CLI is already configured
    if aws sts get-caller-identity &> /dev/null; then
        current_user=$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null || echo "Unknown")
        print_status "AWS CLI is already configured for: $current_user"
        
        read -p "Do you want to reconfigure AWS CLI? (y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            print_status "Skipping AWS CLI configuration"
            return 0
        fi
    fi
    
    print_status "You'll need your AWS credentials. You can find them in:"
    print_status "1. AWS Console → IAM → Users → [Your User] → Security credentials"
    print_status "2. Or create a new access key if you don't have one"
    echo
    
    # Get AWS credentials from user
    read -p "Enter your AWS Access Key ID: " aws_access_key_id
    read -s -p "Enter your AWS Secret Access Key: " aws_secret_access_key
    echo
    
    # Get default region
    print_status "Common AWS regions:"
    print_status "  us-east-1 (N. Virginia)"
    print_status "  us-west-2 (Oregon)"
    print_status "  eu-west-1 (Ireland)"
    print_status "  ap-south-1 (Mumbai)"
    print_status "  ap-southeast-1 (Singapore)"
    echo
    read -p "Enter your default AWS region [us-east-1]: " aws_region
    aws_region=${aws_region:-us-east-1}
    
    # Configure AWS CLI
    aws configure set aws_access_key_id "$aws_access_key_id"
    aws configure set aws_secret_access_key "$aws_secret_access_key"
    aws configure set default.region "$aws_region"
    aws configure set default.output "json"
    
    # Verify configuration
    print_status "Verifying AWS CLI configuration..."
    if aws sts get-caller-identity &> /dev/null; then
        user_info=$(aws sts get-caller-identity --query 'Arn' --output text)
        account_id=$(aws sts get-caller-identity --query 'Account' --output text)
        print_status "AWS CLI configured successfully ✓"
        print_status "User: $user_info"
        print_status "Account ID: $account_id"
        print_status "Region: $aws_region"
    else
        print_error "AWS CLI configuration failed. Please check your credentials."
        exit 1
    fi
}

# Create EC2 Key Pair
create_ec2_keypair() {
    print_header "Creating EC2 Key Pair..."
    
    # Get key pair name
    read -p "Enter a name for your EC2 key pair [placement-cms-key]: " key_name
    key_name=${key_name:-placement-cms-key}
    
    # Check if key pair already exists
    if aws ec2 describe-key-pairs --key-names "$key_name" &> /dev/null; then
        print_warning "Key pair '$key_name' already exists"
        read -p "Do you want to delete and recreate it? (y/N): " recreate
        if [[ $recreate =~ ^[Yy]$ ]]; then
            print_status "Deleting existing key pair..."
            aws ec2 delete-key-pair --key-name "$key_name"
            rm -f "${key_name}.pem"
        else
            print_status "Using existing key pair"
            return 0
        fi
    fi
    
    # Create new key pair
    print_status "Creating new key pair: $key_name"
    aws ec2 create-key-pair \
        --key-name "$key_name" \
        --query 'KeyMaterial' \
        --output text > "${key_name}.pem"
    
    # Set proper permissions
    chmod 400 "${key_name}.pem"
    
    # Verify key pair creation
    if aws ec2 describe-key-pairs --key-names "$key_name" &> /dev/null; then
        print_status "Key pair '$key_name' created successfully ✓"
        print_status "Private key saved as: ${key_name}.pem"
        print_warning "Keep this file secure! You'll need it to connect to your EC2 instances."
        
        # Save key name to environment file
        echo "export EC2_KEY_NAME=$key_name" >> .env.aws
        print_status "Key name saved to .env.aws"
    else
        print_error "Failed to create key pair"
        exit 1
    fi
}

# Setup AWS environment file
setup_environment() {
    print_header "Setting up environment configuration..."
    
    # Get current AWS configuration
    aws_region=$(aws configure get region)
    account_id=$(aws sts get-caller-identity --query 'Account' --output text)
    
    # Create .env.aws file
    cat > .env.aws << EOF
# AWS Configuration
export AWS_REGION=$aws_region
export AWS_ACCOUNT_ID=$account_id
export EC2_KEY_NAME=${key_name:-placement-cms-key}

# Deployment Configuration
export STACK_NAME=placement-cms
export INSTANCE_TYPE=t3.medium

# Application Configuration (update these with your Supabase details)
export NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
    
    print_status "Environment file created: .env.aws"
    print_status "Please update the Supabase configuration in .env.aws"
}

# Test AWS permissions
test_aws_permissions() {
    print_header "Testing AWS permissions..."
    
    # Test basic permissions
    tests=(
        "aws sts get-caller-identity"
        "aws ec2 describe-regions --region us-east-1"
        "aws iam get-user"
    )
    
    for test in "${tests[@]}"; do
        if $test &> /dev/null; then
            print_status "✓ $(echo $test | cut -d' ' -f2-)"
        else
            print_warning "✗ $(echo $test | cut -d' ' -f2-) - Limited permissions"
        fi
    done
    
    print_status "Permission test completed"
}

# Display next steps
show_next_steps() {
    print_header "Setup Complete! Next Steps:"
    echo
    print_status "1. Source the environment file:"
    echo "   source .env.aws"
    echo
    print_status "2. Update Supabase configuration in .env.aws"
    echo
    print_status "3. Deploy using CloudFormation:"
    echo "   aws cloudformation create-stack \\"
    echo "     --stack-name \$STACK_NAME \\"
    echo "     --template-body file://aws/cloudformation-template.yaml \\"
    echo "     --parameters ParameterKey=KeyPairName,ParameterValue=\$EC2_KEY_NAME \\"
    echo "                  ParameterKey=InstanceType,ParameterValue=\$INSTANCE_TYPE \\"
    echo "     --capabilities CAPABILITY_IAM"
    echo
    print_status "4. Or use the deployment script:"
    echo "   ./deploy.sh"
    echo
    print_status "Files created:"
    print_status "  - ${key_name:-placement-cms-key}.pem (EC2 private key)"
    print_status "  - .env.aws (environment configuration)"
    echo
    print_warning "Important: Keep your .pem file secure and never commit it to version control!"
}

# Main setup function
main() {
    print_header "AWS CLI and EC2 Key Pair Setup for Placement CMS"
    echo
    
    check_os
    install_aws_cli
    configure_aws_cli
    create_ec2_keypair
    setup_environment
    test_aws_permissions
    show_next_steps
    
    print_status "🎉 AWS setup completed successfully!"
}

# Run main function
main "$@"
