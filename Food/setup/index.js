const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Initialize express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup wizard steps
const SETUP_STEPS = {
  WELCOME: 'welcome',
  REQUIREMENTS: 'requirements',
  DATABASE: 'database',
  ADMIN: 'admin',
  SITE_CONFIG: 'site_config',
  INSTALL: 'install',
  COMPLETE: 'complete'
};

// Store setup data
let setupData = {
  step: SETUP_STEPS.WELCOME,
  dbConfig: {
    host: 'localhost',
    port: '27017',
    name: 'food_ordering',
    user: '',
    password: ''
  },
  adminUser: {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  siteConfig: {
    siteName: 'Food Ordering System',
    siteUrl: '',
    currency: 'USD',
    taxRate: 10,
    deliveryFee: 5
  },
  installationComplete: false
};

// Check system requirements
const checkRequirements = () => {
  const requirements = {
    node: { required: '14.0.0', current: process.version.slice(1) },
    npm: { required: '6.0.0', current: '' }
  };
  
  try {
    requirements.npm.current = execSync('npm -v').toString().trim();
  } catch (error) {
    requirements.npm.current = 'Not found';
  }
  
  const nodeVersion = requirements.node.current.split('.');
  const nodeRequired = requirements.node.required.split('.');
  const nodePass = 
    parseInt(nodeVersion[0]) > parseInt(nodeRequired[0]) || 
    (parseInt(nodeVersion[0]) === parseInt(nodeRequired[0]) && parseInt(nodeVersion[1]) >= parseInt(nodeRequired[1]));
  
  const npmVersion = requirements.npm.current.split('.');
  const npmRequired = requirements.npm.required.split('.');
  const npmPass = 
    parseInt(npmVersion[0]) > parseInt(npmRequired[0]) || 
    (parseInt(npmVersion[0]) === parseInt(npmRequired[0]) && parseInt(npmVersion[1]) >= parseInt(npmRequired[1]));
  
  return {
    node: { ...requirements.node, pass: nodePass },
    npm: { ...requirements.npm, pass: npmPass },
    allPassed: nodePass && npmPass
  };
};

// Check directory permissions
const checkDirectoryPermissions = () => {
  const dirs = [
    { path: path.join(__dirname, '..'), name: 'Root directory' },
    { path: path.join(__dirname, '..', 'uploads'), name: 'Uploads directory' }
  ];
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(dirs[1].path)) {
    try {
      fs.mkdirSync(dirs[1].path, { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }
  
  const results = dirs.map(dir => {
    let writable = false;
    try {
      const testFile = path.join(dir.path, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      writable = true;
    } catch (error) {
      writable = false;
    }
    return { ...dir, writable };
  });
  
  return {
    directories: results,
    allWritable: results.every(dir => dir.writable)
  };
};

// Test database connection
const testDbConnection = async (config) => {
  let connectionString = 'mongodb://';
  
  if (config.user && config.password) {
    connectionString += `${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@`;
  }
  
  connectionString += `${config.host}:${config.port}/${config.name}`;
  
  try {
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await mongoose.connection.close();
    return { success: true, message: 'Database connection successful!' };
  } catch (error) {
    return { success: false, message: `Database connection failed: ${error.message}` };
  }
};

// Create .env file
const createEnvFile = (data) => {
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb://${data.dbConfig.user ? `${encodeURIComponent(data.dbConfig.user)}:${encodeURIComponent(data.dbConfig.password)}@` : ''}${data.dbConfig.host}:${data.dbConfig.port}/${data.dbConfig.name}

# JWT Authentication
JWT_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=${data.siteConfig.siteUrl}

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
SITE_NAME=${data.siteConfig.siteName}
CURRENCY=${data.siteConfig.currency}
TAX_RATE=${data.siteConfig.taxRate}
DELIVERY_FEE=${data.siteConfig.deliveryFee}
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
};

// Create admin user
const createAdminUser = async (data) => {
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    role: String,
    createdAt: Date,
    updatedAt: Date
  }));
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.adminUser.password, salt);
  
  // Create admin user
  const adminUser = new User({
    name: data.adminUser.name,
    email: data.adminUser.email,
    phone: '0000000000', // Default placeholder
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await adminUser.save();
};

// API Routes
app.get('/api/setup/status', (req, res) => {
  res.json({ step: setupData.step, installationComplete: setupData.installationComplete });
});

app.get('/api/setup/requirements', (req, res) => {
  const requirements = checkRequirements();
  const permissions = checkDirectoryPermissions();
  
  res.json({
    requirements,
    permissions,
    canProceed: requirements.allPassed && permissions.allWritable
  });
});

app.post('/api/setup/database', async (req, res) => {
  const { host, port, name, user, password } = req.body;
  
  setupData.dbConfig = { host, port, name, user, password };
  
  const connectionResult = await testDbConnection(setupData.dbConfig);
  
  if (connectionResult.success) {
    setupData.step = SETUP_STEPS.ADMIN;
    res.json({ success: true, message: connectionResult.message });
  } else {
    res.json({ success: false, message: connectionResult.message });
  }
});

app.post('/api/setup/admin', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match' });
  }
  
  setupData.adminUser = { name, email, password, confirmPassword };
  setupData.step = SETUP_STEPS.SITE_CONFIG;
  
  res.json({ success: true });
});

app.post('/api/setup/site-config', (req, res) => {
  const { siteName, siteUrl, currency, taxRate, deliveryFee } = req.body;
  
  setupData.siteConfig = { siteName, siteUrl, currency, taxRate, deliveryFee };
  setupData.step = SETUP_STEPS.INSTALL;
  
  res.json({ success: true });
});

app.post('/api/setup/install', async (req, res) => {
  try {
    // Connect to database
    let connectionString = 'mongodb://';
    
    if (setupData.dbConfig.user && setupData.dbConfig.password) {
      connectionString += `${encodeURIComponent(setupData.dbConfig.user)}:${encodeURIComponent(setupData.dbConfig.password)}@`;
    }
    
    connectionString += `${setupData.dbConfig.host}:${setupData.dbConfig.port}/${setupData.dbConfig.name}`;
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create .env file
    createEnvFile(setupData);
    
    // Create admin user
    await createAdminUser(setupData);
    
    // Mark installation as complete
    setupData.step = SETUP_STEPS.COMPLETE;
    setupData.installationComplete = true;
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: `Installation failed: ${error.message}` });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Setup wizard running on port ${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT} to start the installation`);
});
