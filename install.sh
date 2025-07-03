#!/bin/bash
#
# =================================================================
# Auto Installer for Next.js App on Ubuntu 24
#
# Creator: Tirta Sadewa
#
# This script will:
# 1. Update the system and install necessary packages (Nginx, Git).
# 2. Install Node.js (LTS version) and PM2.
# 3. Configure Nginx as a reverse proxy for the Next.js app.
# 4. Set up the firewall with UFW.
# 5. Build and start the application using PM2 to run in the background.
#
# Usage:
# 1. Place this script in the root of your Next.js project.
# 2. Make it executable: chmod +x install.sh
# 3. Run it with sudo: sudo ./install.sh
# =================================================================

# --- Stop on any error ---
set -e

# --- Configuration ---
# The port your Next.js app will run on. `next start` defaults to 3000.
APP_PORT=3000
# The name for your PM2 process.
APP_NAME="nextjs-app"

# --- Style Functions ---
echo_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

echo_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

echo_warn() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}


# --- Ensure the script is run as root ---
if [ "$(id -u)" -ne 0 ]; then
  echo_warn "This script must be run as root. Please use sudo."
  exit 1
fi

echo_info "Starting the installation process..."

# --- 1. System Update and Dependency Installation ---
echo_info "Updating system packages and installing dependencies (nginx, curl, git)..."
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl git build-essential

# --- 2. Install Node.js ---
# Using NodeSource repository for Node.js 20.x (LTS)
echo_info "Installing Node.js v20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# --- 3. Install PM2 ---
echo_info "Installing PM2 globally..."
npm install -g pm2

# --- 4. Build the Application ---
# This script assumes it's located in the project root.
echo_info "Installing project dependencies..."
npm install

echo_info "Building the Next.js application for production..."
npm run build

# --- 5. Start the App with PM2 ---
echo_info "Starting the application with PM2..."
# PM2 is a process manager that will keep the app running in the background.
# Check if the app is already running and delete it to ensure a fresh start
pm2 delete "$APP_NAME" || true
# The `pm2 start` command automatically runs the app in the background.
pm2 start npm --name "$APP_NAME" -- start -p $APP_PORT

# --- 6. Configure Nginx ---
echo_info "Configuring Nginx as a reverse proxy..."

# Define the Nginx config content
NGINX_CONFIG="
server {
    listen 80;
    listen [::]:80;

    server_name _; # Replace _ with your domain name

    # Handle ACME-challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
"

# Create the Nginx config file
echo "$NGINX_CONFIG" > /etc/nginx/sites-available/$APP_NAME

# Remove the default Nginx config and enable our app's config
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Test Nginx configuration and restart
echo_info "Testing and restarting Nginx..."
nginx -t
systemctl restart nginx

# --- 7. Configure Firewall (UFW) ---
echo_info "Configuring firewall with UFW..."
ufw allow 'Nginx Full' # Allows both HTTP and HTTPS
ufw allow 'OpenSSH'
ufw --force enable

# --- 8. Set up PM2 to start on boot ---
echo_info "Configuring PM2 to start on system reboot..."
# The `pm2 startup` command generates a command to run. We capture it and execute it.
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $(logname) --hp /home/$(logname)
pm2 save

echo_success "Installation complete!"
echo "--------------------------------------------------"
echo "Your Next.js application is now running in the background."
echo "You can safely close your terminal connection."
echo ""
echo "It is managed by PM2 under the name: $APP_NAME"
echo "You can monitor it with: pm2 monit"
echo ""
echo "Nginx is configured to serve your app on port 80."
echo "Point your domain's A record to this server's IP address."
echo ""
echo_warn "For HTTPS (recommended), run 'sudo certbot --nginx' after setting up your domain."
echo "--------------------------------------------------"
