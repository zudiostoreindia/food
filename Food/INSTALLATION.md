# Food Ordering System - Installation Guide

This guide will help you install the Food Ordering System on your server. The system includes both a setup wizard for easy installation and manual installation instructions.

## Table of Contents

1. [Requirements](#requirements)
2. [Setup Wizard Installation](#setup-wizard-installation)
3. [Manual Installation](#manual-installation)
4. [Shared Hosting Installation](#shared-hosting-installation)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

## Requirements

Before installing, ensure your server meets these minimum requirements:

- Node.js 14.0.0 or higher
- NPM 6.0.0 or higher
- MongoDB 4.0 or higher
- 512MB RAM minimum (1GB+ recommended)
- 1GB disk space minimum

## Setup Wizard Installation

The easiest way to install the Food Ordering System is using the setup wizard:

1. Upload the entire project folder to your server
2. Navigate to the project root directory
3. Run the following commands:

```bash
npm install
cd setup
npm install
node index.js
```

4. Open your browser and navigate to `http://your-server-address:3000`
5. Follow the on-screen instructions to complete the installation

The setup wizard will guide you through:
- System requirements check
- Database configuration
- Admin user creation
- Site configuration
- Final installation

## Manual Installation

If you prefer to install manually or the setup wizard doesn't work for your environment:

1. Upload the entire project folder to your server
2. Navigate to the project root directory
3. Create a `.env` file based on the `.env.example` template
4. Configure your MongoDB connection in the `.env` file
5. Run the following commands:

```bash
npm install
npm run build
npm start
```

6. Access the admin panel at `http://your-server-address/admin`
7. Log in with the default credentials:
   - Email: admin@example.com
   - Password: admin123
8. Change the default password immediately

## Shared Hosting Installation

Installing on shared hosting requires a few additional steps since you may not have direct Node.js access:

### Prerequisites
- A shared hosting account with Node.js support
- Access to MongoDB (either hosted externally or provided by your hosting)
- SSH access or a control panel that supports Node.js applications

### Installation Steps

1. **Prepare your hosting environment**:
   - Check if your hosting provider supports Node.js applications
   - Verify MongoDB availability (either as a service or allow external connections)
   - Ensure you have the necessary permissions to run Node.js applications

2. **Upload the application**:
   - Upload the entire project folder to your hosting account using FTP or the file manager
   - Make sure to preserve file permissions (especially for executable files)

3. **Configure the application**:
   - Create a `.env` file in the root directory based on the `.env.example` template
   - Update the MongoDB connection string to point to your MongoDB instance
   - Set the correct port (often provided by your hosting as an environment variable)

4. **Set up the application through the hosting control panel**:
   - Most shared hosting providers have a section for Node.js applications
   - Set the entry point to `server.js` in the backend directory
   - Configure any necessary environment variables
   - Set up a domain or subdomain to point to your application

5. **Build the frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

6. **Start the application**:
   - Use the control panel to start the Node.js application
   - If your hosting provider supports custom startup commands, use:
   ```bash
   cd backend && npm start
   ```

7. **Verify the installation**:
   - Access your domain or subdomain to check if the application is running
   - Try logging in to the admin panel

### cPanel Specific Instructions

If your shared hosting uses cPanel with Node.js support:

1. Log in to cPanel
2. Find the "Setup Node.js App" section
3. Click "Create Application"
4. Set the application path to your project directory
5. Set the application URL to your domain or subdomain
6. Set the application startup file to `backend/server.js`
7. Set the Node.js version to 14.x or higher
8. Click "Create"

## Configuration

After installation, you can further configure the system by editing the `.env` file:

```
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb://username:password@host:port/database

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=https://your-domain.com

# Stripe API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# File Upload Path
UPLOAD_PATH=./uploads

# Site Configuration
SITE_NAME=Food Ordering System
CURRENCY=USD
TAX_RATE=10
DELIVERY_FEE=5
```

## Troubleshooting

### Common Issues

1. **Connection to MongoDB fails**:
   - Check if MongoDB is running
   - Verify the connection string in the `.env` file
   - Ensure network connectivity between your application and MongoDB
   - Check if MongoDB user has the correct permissions

2. **Application fails to start**:
   - Check the logs for error messages
   - Verify Node.js version is 14.0.0 or higher
   - Ensure all dependencies are installed with `npm install`
   - Check if the required ports are available

3. **Upload directory is not writable**:
   - Check directory permissions (should be 755 or 775)
   - Ensure the web server user has write permissions
   - Create the directory manually if it doesn't exist

4. **Admin panel is inaccessible**:
   - Verify the admin user was created during installation
   - Check for any error messages in the browser console
   - Ensure the frontend was built correctly

5. **Shared hosting specific issues**:
   - Contact your hosting provider to verify Node.js support
   - Check if the hosting provider has specific requirements for Node.js applications
   - Verify if the hosting provider allows the necessary ports

For additional support, please refer to the documentation or contact our support team.
