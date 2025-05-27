#!/bin/bash

# Oracle Cloud Always Free Setup Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
    echo -e "${BLUE}[ORACLE]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Account creation guide
create_oracle_account() {
    print_header "Step 1: Create Oracle Cloud Account"
    
    echo "1. Go to https://www.oracle.com/cloud/free/"
    echo "2. Click 'Start for free'"
    echo "3. Fill in your details:"
    echo "   - Email address"
    echo "   - Country/Territory"
    echo "   - First and Last name"
    echo "4. Verify your email"
    echo "5. Complete phone verification"
    echo "6. Add payment method (for verification only - won't be charged)"
    echo "7. Wait for account activation (can take 24-48 hours)"
    echo
    print_warning "Oracle requires payment method for verification but won't charge for Always Free resources"
    print_warning "Account activation can take 24-48 hours"
    echo
    
    read -p "Press Enter when your Oracle Cloud account is ready..."
}

# OCI CLI installation
install_oci_cli() {
    print_header "Step 2: Install OCI CLI"
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Installing OCI CLI for Linux..."
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "Installing OCI CLI for macOS..."
        if command -v brew &> /dev/null; then
            brew install oci-cli
        else
            bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
        fi
    else
        print_status "For Windows, download from:"
        print_status "https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
        return
    fi
    
    # Add to PATH
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    
    print_status "OCI CLI installed successfully"
}

# Configure OCI CLI
configure_oci_cli() {
    print_header "Step 3: Configure OCI CLI"
    
    print_status "You'll need these details from Oracle Cloud Console:"
    echo "1. Go to Oracle Cloud Console"
    echo "2. Click on your profile (top right)"
    echo "3. Go to 'User Settings'"
    echo "4. Note down:"
    echo "   - User OCID"
    echo "   - Tenancy OCID"
    echo "   - Region"
    echo
    
    read -p "Press Enter when you have these details..."
    
    print_status "Running OCI CLI configuration..."
    oci setup config
    
    print_status "Testing OCI CLI configuration..."
    if oci iam region list &> /dev/null; then
        print_status "✅ OCI CLI configured successfully"
    else
        print_error "❌ OCI CLI configuration failed"
        exit 1
    fi
}

# Create compute instance
create_compute_instance() {
    print_header "Step 4: Create Compute Instance"
    
    print_status "We'll create an ARM-based instance for better performance"
    
    # Get availability domain
    print_status "Getting availability domains..."
    AVAILABILITY_DOMAIN=$(oci iam availability-domain list --query 'data[0].name' --raw-output)
    
    # Get compartment OCID (root compartment)
    COMPARTMENT_OCID=$(oci iam compartment list --query 'data[?name==`root`].id | [0]' --raw-output)
    
    # Get subnet OCID (we'll create VCN first)
    create_vcn
    
    print_status "Creating ARM Ampere A1 compute instance..."
    
    # Create instance
    INSTANCE_OCID=$(oci compute instance launch \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --compartment-id "$COMPARTMENT_OCID" \
        --shape "VM.Standard.A1.Flex" \
        --shape-config '{"ocpus": 4, "memoryInGBs": 24}' \
        --image-id "$(get_arm_ubuntu_image)" \
        --subnet-id "$SUBNET_OCID" \
        --display-name "placement-cms-server" \
        --assign-public-ip true \
        --ssh-authorized-keys-file ~/.ssh/id_rsa.pub \
        --wait-for-state RUNNING \
        --query 'data.id' \
        --raw-output)
    
    print_status "✅ Compute instance created: $INSTANCE_OCID"
    
    # Get public IP
    PUBLIC_IP=$(oci compute instance list-vnics \
        --instance-id "$INSTANCE_OCID" \
        --query 'data[0]."public-ip"' \
        --raw-output)
    
    print_status "✅ Public IP: $PUBLIC_IP"
    
    # Save to environment file
    echo "export OCI_INSTANCE_OCID=$INSTANCE_OCID" >> .env.oracle
    echo "export OCI_PUBLIC_IP=$PUBLIC_IP" >> .env.oracle
}

# Create VCN (Virtual Cloud Network)
create_vcn() {
    print_status "Creating Virtual Cloud Network..."
    
    # Create VCN
    VCN_OCID=$(oci network vcn create \
        --compartment-id "$COMPARTMENT_OCID" \
        --display-name "placement-cms-vcn" \
        --cidr-block "10.0.0.0/16" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    # Create Internet Gateway
    IGW_OCID=$(oci network internet-gateway create \
        --compartment-id "$COMPARTMENT_OCID" \
        --vcn-id "$VCN_OCID" \
        --display-name "placement-cms-igw" \
        --is-enabled true \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    # Create Route Table
    RT_OCID=$(oci network route-table create \
        --compartment-id "$COMPARTMENT_OCID" \
        --vcn-id "$VCN_OCID" \
        --display-name "placement-cms-rt" \
        --route-rules '[{"destination": "0.0.0.0/0", "destinationType": "CIDR_BLOCK", "networkEntityId": "'$IGW_OCID'"}]' \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    # Create Security List
    SL_OCID=$(oci network security-list create \
        --compartment-id "$COMPARTMENT_OCID" \
        --vcn-id "$VCN_OCID" \
        --display-name "placement-cms-sl" \
        --egress-security-rules '[{"destination": "0.0.0.0/0", "protocol": "all", "isStateless": false}]' \
        --ingress-security-rules '[
            {"source": "0.0.0.0/0", "protocol": "6", "isStateless": false, "tcpOptions": {"destinationPortRange": {"min": 22, "max": 22}}},
            {"source": "0.0.0.0/0", "protocol": "6", "isStateless": false, "tcpOptions": {"destinationPortRange": {"min": 80, "max": 80}}},
            {"source": "0.0.0.0/0", "protocol": "6", "isStateless": false, "tcpOptions": {"destinationPortRange": {"min": 443, "max": 443}}}
        ]' \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    # Create Subnet
    SUBNET_OCID=$(oci network subnet create \
        --compartment-id "$COMPARTMENT_OCID" \
        --vcn-id "$VCN_OCID" \
        --display-name "placement-cms-subnet" \
        --cidr-block "10.0.1.0/24" \
        --route-table-id "$RT_OCID" \
        --security-list-ids '["'$SL_OCID'"]' \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    print_status "✅ VCN created successfully"
}

# Get ARM Ubuntu image
get_arm_ubuntu_image() {
    oci compute image list \
        --compartment-id "$COMPARTMENT_OCID" \
        --operating-system "Canonical Ubuntu" \
        --shape "VM.Standard.A1.Flex" \
        --query 'data[0].id' \
        --raw-output
}

# Setup SSH key
setup_ssh_key() {
    print_header "Step 5: Setup SSH Key"
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        print_status "Generating SSH key pair..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        print_status "✅ SSH key generated"
    else
        print_status "SSH key already exists"
    fi
    
    print_status "Public key location: ~/.ssh/id_rsa.pub"
    print_status "Public key content:"
    cat ~/.ssh/id_rsa.pub
}

# Create Autonomous Database
create_autonomous_database() {
    print_header "Step 6: Create Autonomous Database (Optional)"
    
    read -p "Do you want to create an Autonomous Database? (y/N): " create_adb
    if [[ ! $create_adb =~ ^[Yy]$ ]]; then
        print_status "Skipping Autonomous Database creation"
        return
    fi
    
    print_status "Creating Autonomous Database..."
    
    # Generate admin password
    DB_PASSWORD=$(openssl rand -base64 12)
    
    ADB_OCID=$(oci db autonomous-database create \
        --compartment-id "$COMPARTMENT_OCID" \
        --db-name "placementcms" \
        --display-name "Placement CMS Database" \
        --admin-password "$DB_PASSWORD" \
        --cpu-core-count 1 \
        --data-storage-size-in-tbs 1 \
        --is-free-tier true \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
    
    print_status "✅ Autonomous Database created: $ADB_OCID"
    print_warning "Database admin password: $DB_PASSWORD"
    print_warning "Save this password securely!"
    
    # Save to environment file
    echo "export OCI_ADB_OCID=$ADB_OCID" >> .env.oracle
    echo "export OCI_DB_PASSWORD=$DB_PASSWORD" >> .env.oracle
}

# Generate deployment script
generate_deployment_script() {
    print_header "Step 7: Generate Deployment Script"
    
    cat > deploy-to-oracle.sh << 'EOF'
#!/bin/bash

# Deploy Placement CMS to Oracle Cloud
set -e

# Load environment variables
source .env.oracle

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Connect to instance and setup
print_status "Connecting to Oracle Cloud instance..."

ssh -o StrictHostKeyChecking=no ubuntu@$OCI_PUBLIC_IP << 'REMOTE_SCRIPT'
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create application directory
mkdir -p ~/placement-cms
cd ~/placement-cms

# Install PM2
sudo npm install -g pm2

echo "✅ Server setup completed!"
REMOTE_SCRIPT

# Copy application files
print_status "Copying application files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' ./ ubuntu@$OCI_PUBLIC_IP:~/placement-cms/

# Setup and start application
ssh ubuntu@$OCI_PUBLIC_IP << 'REMOTE_SCRIPT'
cd ~/placement-cms

# Install dependencies
npm install

# Build application
npm run build

# Create environment file
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
EOF

# Start with PM2
pm2 start npm --name "placement-cms" -- start
pm2 startup
pm2 save

# Setup nginx
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/placement-cms << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONFIG

sudo ln -sf /etc/nginx/sites-available/placement-cms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Application deployed successfully!"
echo "🌐 Access your app at: http://$OCI_PUBLIC_IP"
REMOTE_SCRIPT

print_status "🎉 Deployment completed!"
print_status "Your Placement CMS is running at: http://$OCI_PUBLIC_IP"
EOF

    chmod +x deploy-to-oracle.sh
    print_status "✅ Deployment script created: deploy-to-oracle.sh"
}

# Show final instructions
show_final_instructions() {
    print_header "🎉 Oracle Cloud Setup Complete!"
    
    echo "What you've created:"
    echo "✅ ARM Ampere A1 compute instance (4 cores, 24GB RAM)"
    echo "✅ Virtual Cloud Network with security rules"
    echo "✅ SSH key pair for secure access"
    echo "✅ Deployment script for your application"
    echo
    echo "Next steps:"
    echo "1. Configure your Supabase credentials in .env.oracle"
    echo "2. Run the deployment script: ./deploy-to-oracle.sh"
    echo "3. Access your application at: http://$PUBLIC_IP"
    echo
    echo "Files created:"
    echo "- .env.oracle (Oracle Cloud configuration)"
    echo "- deploy-to-oracle.sh (Deployment script)"
    echo "- ~/.ssh/id_rsa (SSH private key)"
    echo "- ~/.ssh/id_rsa.pub (SSH public key)"
    echo
    print_warning "Keep your SSH keys and .env.oracle file secure!"
    print_warning "Your instance will run 24/7 - monitor usage in Oracle Cloud Console"
}

# Main setup function
main() {
    print_header "🏛️ Oracle Cloud Always Free Setup"
    echo "Setting up the most powerful free cloud infrastructure..."
    echo
    
    create_oracle_account
    install_oci_cli
    configure_oci_cli
    setup_ssh_key
    create_compute_instance
    create_autonomous_database
    generate_deployment_script
    show_final_instructions
    
    print_status "🎯 Oracle Cloud setup completed successfully!"
}

# Run main function
main "$@"
