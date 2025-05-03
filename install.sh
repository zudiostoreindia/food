#!/bin/bash

# Food Ordering System - One-Command Installation Script
# This script automates the installation process for the Food Ordering System

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Welcome message
clear
echo "============================================================"
echo "       Food Ordering System - Installation Script"
echo "============================================================"
echo ""
echo "This script will install and configure the Food Ordering System."
echo "Make sure you have the following prerequisites:"
echo "  - Node.js (v14.0.0 or higher)"
echo "  - npm (v6.0.0 or higher)"
echo "  - MongoDB (v4.0 or higher)"
echo ""
echo "The installation will:"
echo "  1. Check system requirements"
echo "  2. Install dependencies"
echo "  3. Configure the database"
echo "  4. Set up environment variables"
echo "  5. Build the frontend"
echo "  6. Start the application"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Check system requirements
print_message "Checking system requirements..."

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v | cut -d "v" -f 2)
  print_message "Node.js version: $NODE_VERSION"
  
  # Compare versions (simple check)
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d "." -f 1)
  if [ "$NODE_MAJOR" -lt 14 ]; then
    print_error "Node.js version must be 14.0.0 or higher. Please upgrade Node.js and try again."
    exit 1
  fi
else
  print_error "Node.js is not installed. Please install Node.js (v14.0.0 or higher) and try again."
  exit 1
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  print_message "npm version: $NPM_VERSION"
  
  # Compare versions (simple check)
  NPM_MAJOR=$(echo $NPM_VERSION | cut -d "." -f 1)
  if [ "$NPM_MAJOR" -lt 6 ]; then
    print_warning "npm version should be 6.0.0 or higher. Consider upgrading npm."
  fi
else
  print_error "npm is not installed. Please install npm and try again."
  exit 1
fi

# Check MongoDB
if command_exists mongod; then
  print_message "MongoDB is installed."
else
  print_warning "MongoDB command not found. Make sure MongoDB is installed and accessible."
  read -p "Do you want to continue anyway? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Installation aborted."
    exit 1
  fi
fi

# Get installation directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
print_message "Installation directory: $SCRIPT_DIR"

# Install backend dependencies
print_message "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install
if [ $? -ne 0 ]; then
  print_error "Failed to install backend dependencies."
  exit 1
fi

# Install frontend dependencies
print_message "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install
if [ $? -ne 0 ]; then
  print_error "Failed to install frontend dependencies."
  exit 1
fi

# Install setup wizard dependencies
print_message "Installing setup wizard dependencies..."
cd "$SCRIPT_DIR/setup"
npm install
if [ $? -ne 0 ]; then
  print_warning "Failed to install setup wizard dependencies. Continuing anyway..."
fi

# Configure environment variables
cd "$SCRIPT_DIR/backend"
if [ ! -f .env ]; then
  print_message "Creating .env file..."
  
  # Generate random JWT secret
  JWT_SECRET=$(openssl rand -hex 32)
  
  # Ask for MongoDB connection details
  echo ""
  echo "MongoDB Configuration:"
  read -p "MongoDB Host (default: localhost): " MONGO_HOST
  MONGO_HOST=${MONGO_HOST:-localhost}
  
  read -p "MongoDB Port (default: 27017): " MONGO_PORT
  MONGO_PORT=${MONGO_PORT:-27017}
  
  read -p "MongoDB Database Name (default: food_ordering): " MONGO_DB
  MONGO_DB=${MONGO_DB:-food_ordering}
  
  read -p "MongoDB Username (leave empty if none): " MONGO_USER
  
  if [ ! -z "$MONGO_USER" ]; then
    read -s -p "MongoDB Password: " MONGO_PASS
    echo
    MONGO_AUTH="${MONGO_USER}:${MONGO_PASS}@"
  else
    MONGO_AUTH=""
  fi
  
  # Create .env file
  cat > .env << EOL
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://${MONGO_AUTH}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Stripe API Keys (Replace with your own)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (optional)
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
EOL

  print_message ".env file created successfully."
else
  print_warning ".env file already exists. Skipping configuration."
fi

# Create uploads directory
mkdir -p "$SCRIPT_DIR/backend/uploads"
print_message "Created uploads directory."

# Build frontend
print_message "Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm run build
if [ $? -ne 0 ]; then
  print_error "Failed to build frontend."
  exit 1
fi

# Create admin user (optional)
cd "$SCRIPT_DIR"
echo ""
read -p "Do you want to create an admin user now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Start MongoDB if not running (simple check)
  if ! pgrep mongod > /dev/null; then
    print_warning "MongoDB doesn't seem to be running. Attempting to start it..."
    mongod --fork --logpath /dev/null
    sleep 3
  fi
  
  # Run setup wizard for admin creation
  print_message "Starting setup wizard for admin creation..."
  cd "$SCRIPT_DIR/setup"
  node index.js &
  SETUP_PID=$!
  
  print_message "Setup wizard started. Please open http://localhost:3000 in your browser to create an admin user."
  print_message "Press Enter when you've completed the setup wizard..."
  read
  
  # Kill setup wizard process
  kill $SETUP_PID 2>/dev/null
fi

# Installation complete
echo ""
echo "============================================================"
echo "       Food Ordering System - Installation Complete"
echo "============================================================"
echo ""
print_message "The Food Ordering System has been successfully installed!"
echo ""
echo "To start the backend server:"
echo "  cd $SCRIPT_DIR/backend"
echo "  npm run dev"
echo ""
echo "To start the frontend development server:"
echo "  cd $SCRIPT_DIR/frontend"
echo "  npm run dev"
echo ""
echo "Then open your browser and navigate to: http://localhost:3000"
echo ""
echo "For production deployment, please refer to DIGITAL_OCEAN_DEPLOYMENT.md"
echo "or INSTALLATION.md for detailed instructions."
echo ""

# Ask if user wants to start the application now
read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  print_message "Starting backend server..."
  cd "$SCRIPT_DIR/backend"
  npm run dev &
  BACKEND_PID=$!
  
  print_message "Starting frontend development server..."
  cd "$SCRIPT_DIR/frontend"
  npm run dev &
  FRONTEND_PID=$!
  
  print_message "Application started!"
  print_message "Backend running at: http://localhost:5000"
  print_message "Frontend running at: http://localhost:3000"
  print_message "Press Ctrl+C to stop the servers..."
  
  # Wait for user to press Ctrl+C
  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
  wait
fi

exit 0
