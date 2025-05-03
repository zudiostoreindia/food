# Deploying Food Ordering System on Digital Ocean

This guide provides step-by-step instructions for deploying the Food Ordering System on a Digital Ocean Droplet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Digital Ocean Droplet](#creating-a-digital-ocean-droplet)
3. [Initial Server Setup](#initial-server-setup)
4. [Installing Dependencies](#installing-dependencies)
5. [Deploying the Application](#deploying-the-application)
6. [Setting Up MongoDB](#setting-up-mongodb)
7. [Configuring Nginx as a Reverse Proxy](#configuring-nginx-as-a-reverse-proxy)
8. [Securing with SSL/TLS (HTTPS)](#securing-with-ssltls-https)
9. [Setting Up PM2 for Process Management](#setting-up-pm2-for-process-management)
10. [Automating Deployments (Optional)](#automating-deployments-optional)
11. [Monitoring and Maintenance](#monitoring-and-maintenance)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, you'll need:

1. A Digital Ocean account
2. A domain name (optional, but recommended)
3. SSH client installed on your local machine
4. Basic knowledge of terminal/command line

## Creating a Digital Ocean Droplet

1. **Log in** to your Digital Ocean account
2. Click on **Create** > **Droplets**
3. Choose an image: **Ubuntu 20.04 (LTS)**
4. Select a plan:
   - For small to medium traffic: Basic Plan with 2GB RAM/1 CPU
   - For higher traffic: 4GB RAM/2 CPU or higher
5. Choose a datacenter region closest to your target audience
6. Add your SSH key or create a password
7. Click **Create Droplet**

## Initial Server Setup

Once your Droplet is created, connect to it via SSH:

```bash
ssh root@your_server_ip
```

### Create a New User

```bash
adduser foodadmin
usermod -aG sudo foodadmin
```

### Set Up Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Switch to the New User

```bash
su - foodadmin
```

## Installing Dependencies

### Update Package Lists

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js and npm

```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node -v
npm -v
```

### Install MongoDB

```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Verify MongoDB is running:

```bash
sudo systemctl status mongodb
```

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Additional Tools

```bash
sudo apt install -y git build-essential
```

## Deploying the Application

### Create Application Directory

```bash
sudo mkdir -p /var/www/foodordering
sudo chown -R foodadmin:foodadmin /var/www/foodordering
```

### Clone the Repository

```bash
cd /var/www/foodordering
git clone https://github.com/yourusername/food-ordering-system.git .
```

Alternatively, upload your local files:

```bash
# From your local machine
scp -r /path/to/Food foodadmin@your_server_ip:/var/www/foodordering
```

### Install Application Dependencies

```bash
# Install backend dependencies
cd /var/www/foodordering/backend
npm install --production

# Install frontend dependencies
cd /var/www/foodordering/frontend
npm install --production
```

### Build the Frontend

```bash
cd /var/www/foodordering/frontend
npm run build
```

### Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd /var/www/foodordering/backend
cp .env.example .env
nano .env
```

Update the following variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=your_secure_random_string
FRONTEND_URL=https://yourdomain.com
```

## Setting Up MongoDB

### Secure MongoDB (Optional but Recommended)

Create an admin user:

```bash
mongo
```

```javascript
use admin
db.createUser({
  user: "adminUser",
  pwd: "securePassword",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

Enable authentication:

```bash
sudo nano /etc/mongodb.conf
```

Add/modify these lines:

```
auth = true
```

Restart MongoDB:

```bash
sudo systemctl restart mongodb
```

### Create Database and User for the Application

```bash
mongo -u adminUser -p securePassword --authenticationDatabase admin
```

```javascript
use food-ordering
db.createUser({
  user: "foodapp",
  pwd: "anotherSecurePassword",
  roles: [ { role: "readWrite", db: "food-ordering" } ]
})
exit
```

Update your `.env` file with the new connection string:

```
MONGODB_URI=mongodb://foodapp:anotherSecurePassword@localhost:27017/food-ordering
```

## Configuring Nginx as a Reverse Proxy

Create a new Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/foodordering
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/foodordering/backend/uploads;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/foodordering /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Securing with SSL/TLS (HTTPS)

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete the setup.

## Setting Up PM2 for Process Management

Install PM2:

```bash
sudo npm install -g pm2
```

Create a PM2 ecosystem file:

```bash
cd /var/www/foodordering
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'food-ordering-backend',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'food-ordering-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
    }
  ]
};
```

Start the application with PM2:

```bash
pm2 start ecosystem.config.js
```

Set up PM2 to start on system boot:

```bash
pm2 startup
```

Follow the instructions provided by the command.

Save the current process list:

```bash
pm2 save
```

## Automating Deployments (Optional)

For automated deployments, you can set up a simple deployment script:

```bash
cd /var/www/foodordering
nano deploy.sh
```

Add the following:

```bash
#!/bin/bash

# Pull latest changes
git pull

# Install backend dependencies
cd /var/www/foodordering/backend
npm install --production

# Install frontend dependencies
cd /var/www/foodordering/frontend
npm install --production

# Build frontend
npm run build

# Restart PM2 processes
cd /var/www/foodordering
pm2 restart all
```

Make the script executable:

```bash
chmod +x deploy.sh
```

## Monitoring and Maintenance

### Monitor the Application

```bash
pm2 status
pm2 logs
```

### Monitoring System Resources

```bash
sudo apt install -y htop
htop
```

### Regular Updates

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Node.js packages
cd /var/www/foodordering/backend
npm update --production

cd /var/www/foodordering/frontend
npm update --production
```

### Database Backups

Set up a daily MongoDB backup:

```bash
sudo nano /etc/cron.daily/mongodb-backup
```

Add the following:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d")
BACKUP_DIR="/var/backups/mongodb"

mkdir -p $BACKUP_DIR

mongodump --db food-ordering --out $BACKUP_DIR/$TIMESTAMP

# Keep only the last 7 backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Make the script executable:

```bash
sudo chmod +x /etc/cron.daily/mongodb-backup
```

## Troubleshooting

### Check Application Logs

```bash
pm2 logs food-ordering-backend
pm2 logs food-ordering-frontend
```

### Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check MongoDB Logs

```bash
sudo tail -f /var/log/mongodb/mongodb.log
```

### Common Issues and Solutions

1. **Application not starting**:
   - Check logs: `pm2 logs`
   - Verify environment variables: `cat /var/www/foodordering/backend/.env`
   - Check if MongoDB is running: `sudo systemctl status mongodb`

2. **Cannot connect to MongoDB**:
   - Verify MongoDB is running: `sudo systemctl status mongodb`
   - Check connection string in `.env`
   - Verify network connectivity: `telnet localhost 27017`

3. **Nginx not serving the application**:
   - Check Nginx configuration: `sudo nginx -t`
   - Verify Nginx is running: `sudo systemctl status nginx`
   - Check firewall settings: `sudo ufw status`

4. **SSL certificate issues**:
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

---

By following this guide, you should have a fully functional Food Ordering System deployed on a Digital Ocean Droplet with:
- Node.js backend API
- React/Next.js frontend
- MongoDB database
- Nginx as a reverse proxy
- SSL/TLS encryption
- PM2 for process management
- Automated backups

For additional support or questions, please refer to the project documentation or contact the development team.
