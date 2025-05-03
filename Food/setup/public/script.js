document.addEventListener('DOMContentLoaded', function() {
  // Setup variables
  const steps = ['welcome', 'requirements', 'database', 'admin', 'site_config', 'install', 'complete'];
  let currentStepIndex = 0;
  
  // DOM elements
  const stepTitle = document.getElementById('step-title');
  const stepContent = document.getElementById('step-content');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  // Initialize setup
  initSetup();
  
  // Setup initialization
  async function initSetup() {
    try {
      const response = await fetch('/api/setup/status');
      const data = await response.json();
      
      if (data.installationComplete) {
        goToStep(steps.indexOf('complete'));
      } else if (data.step !== 'welcome') {
        goToStep(steps.indexOf(data.step));
      }
    } catch (error) {
      console.error('Error initializing setup:', error);
    }
  }
  
  // Event listeners for navigation buttons
  prevBtn.addEventListener('click', () => {
    goToStep(currentStepIndex - 1);
  });
  
  nextBtn.addEventListener('click', async () => {
    // Validate current step before proceeding
    const isValid = await validateStep(steps[currentStepIndex]);
    
    if (isValid) {
      goToStep(currentStepIndex + 1);
    }
  });
  
  // Go to specific step
  function goToStep(index) {
    // Hide all step panes
    document.querySelectorAll('.step-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    // Update step indicators
    document.querySelectorAll('.setup-step').forEach((step, i) => {
      if (i < index) {
        step.classList.remove('active');
        step.classList.add('completed');
      } else if (i === index) {
        step.classList.remove('completed');
        step.classList.add('active');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
    
    // Show current step pane
    const currentStep = steps[index];
    document.getElementById(`${currentStep}-step`).classList.add('active');
    
    // Update step title
    stepTitle.textContent = getStepTitle(currentStep);
    
    // Update button states
    prevBtn.disabled = index === 0;
    
    if (currentStep === 'complete') {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'block';
      nextBtn.textContent = currentStep === 'install' ? 'Install' : 'Next';
    }
    
    // Execute step initialization if needed
    initStep(currentStep);
    
    // Update current step index
    currentStepIndex = index;
  }
  
  // Get step title
  function getStepTitle(step) {
    switch (step) {
      case 'welcome':
        return 'Welcome to Food Ordering System';
      case 'requirements':
        return 'System Requirements';
      case 'database':
        return 'Database Configuration';
      case 'admin':
        return 'Admin Account';
      case 'site_config':
        return 'Site Configuration';
      case 'install':
        return 'Installation';
      case 'complete':
        return 'Installation Complete';
      default:
        return 'Food Ordering System Setup';
    }
  }
  
  // Initialize step specific actions
  async function initStep(step) {
    switch (step) {
      case 'requirements':
        await checkRequirements();
        break;
      case 'install':
        showInstallSummary();
        break;
    }
  }
  
  // Validate current step
  async function validateStep(step) {
    switch (step) {
      case 'welcome':
        return true;
      case 'requirements':
        return validateRequirements();
      case 'database':
        return await validateDatabase();
      case 'admin':
        return validateAdmin();
      case 'site_config':
        return validateSiteConfig();
      case 'install':
        return await performInstallation();
      default:
        return true;
    }
  }
  
  // Check system requirements
  async function checkRequirements() {
    const spinner = document.getElementById('requirements-spinner');
    const resultsDiv = document.getElementById('requirements-results');
    const softwareList = document.getElementById('software-requirements');
    const directoriesList = document.getElementById('directory-permissions');
    const messageDiv = document.getElementById('requirements-message');
    
    spinner.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    
    try {
      const response = await fetch('/api/setup/requirements');
      const data = await response.json();
      
      // Update software requirements list
      softwareList.innerHTML = '';
      Object.entries(data.requirements).forEach(([key, value]) => {
        const listItem = document.createElement('li');
        listItem.className = 'requirements-item';
        
        listItem.innerHTML = `
          <span>${key.toUpperCase()} (Required: ${value.required})</span>
          <span class="requirements-item-status ${value.pass ? 'pass' : 'fail'}">
            ${value.current}
            ${value.pass 
              ? '<svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' 
              : '<svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>'}
          </span>
        `;
        
        softwareList.appendChild(listItem);
      });
      
      // Update directory permissions list
      directoriesList.innerHTML = '';
      data.permissions.directories.forEach(dir => {
        const listItem = document.createElement('li');
        listItem.className = 'requirements-item';
        
        listItem.innerHTML = `
          <span>${dir.name}</span>
          <span class="requirements-item-status ${dir.writable ? 'pass' : 'fail'}">
            ${dir.writable ? 'Writable' : 'Not Writable'}
            ${dir.writable 
              ? '<svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' 
              : '<svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>'}
          </span>
        `;
        
        directoriesList.appendChild(listItem);
      });
      
      // Update message
      if (data.canProceed) {
        messageDiv.innerHTML = '<div class="alert alert-success">Your system meets all requirements!</div>';
      } else {
        messageDiv.innerHTML = '<div class="alert alert-danger">Your system does not meet all requirements. Please fix the issues above before proceeding.</div>';
      }
      
      // Store requirements result for validation
      window.requirementsResult = data.canProceed;
      
    } catch (error) {
      console.error('Error checking requirements:', error);
      messageDiv.innerHTML = '<div class="alert alert-danger">Error checking requirements. Please try again.</div>';
    } finally {
      spinner.classList.add('hidden');
      resultsDiv.classList.remove('hidden');
    }
  }
  
  // Validate requirements step
  function validateRequirements() {
    return window.requirementsResult === true;
  }
  
  // Validate database step
  async function validateDatabase() {
    const host = document.getElementById('db-host').value;
    const port = document.getElementById('db-port').value;
    const name = document.getElementById('db-name').value;
    const user = document.getElementById('db-user').value;
    const password = document.getElementById('db-password').value;
    const messageDiv = document.getElementById('db-connection-message');
    
    if (!host || !port || !name) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
      return false;
    }
    
    messageDiv.innerHTML = '<div class="spinner"></div><div class="mt-2">Testing connection...</div>';
    
    try {
      const response = await fetch('/api/setup/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ host, port, name, user, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        return true;
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        return false;
      }
    } catch (error) {
      console.error('Error validating database:', error);
      messageDiv.innerHTML = '<div class="alert alert-danger">Error testing database connection. Please try again.</div>';
      return false;
    }
  }
  
  // Validate admin step
  function validateAdmin() {
    const name = document.getElementById('admin-name').value;
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;
    const messageDiv = document.getElementById('admin-message');
    
    if (!name || !email || !password || !confirmPassword) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all fields.</div>';
      return false;
    }
    
    if (password !== confirmPassword) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Passwords do not match.</div>';
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid email address.</div>';
      return false;
    }
    
    // Submit admin data
    fetch('/api/setup/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    
    return true;
  }
  
  // Validate site configuration step
  function validateSiteConfig() {
    const siteName = document.getElementById('site-name').value;
    const siteUrl = document.getElementById('site-url').value;
    const currency = document.getElementById('site-currency').value;
    const taxRate = document.getElementById('site-tax-rate').value;
    const deliveryFee = document.getElementById('site-delivery-fee').value;
    const messageDiv = document.getElementById('site-config-message');
    
    if (!siteName || !siteUrl) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
      return false;
    }
    
    // Simple URL validation
    try {
      new URL(siteUrl);
    } catch (error) {
      messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid URL (e.g., https://yourdomain.com).</div>';
      return false;
    }
    
    // Submit site config data
    fetch('/api/setup/site-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ siteName, siteUrl, currency, taxRate, deliveryFee })
    });
    
    return true;
  }
  
  // Show installation summary
  function showInstallSummary() {
    const summaryDiv = document.getElementById('install-summary');
    
    const dbHost = document.getElementById('db-host').value;
    const dbName = document.getElementById('db-name').value;
    const adminEmail = document.getElementById('admin-email').value;
    const siteName = document.getElementById('site-name').value;
    const siteUrl = document.getElementById('site-url').value;
    
    summaryDiv.innerHTML = `
      <div class="mb-4">
        <h3>Database</h3>
        <p>Host: ${dbHost}</p>
        <p>Database: ${dbName}</p>
      </div>
      
      <div class="mb-4">
        <h3>Admin Account</h3>
        <p>Email: ${adminEmail}</p>
      </div>
      
      <div class="mb-4">
        <h3>Site Configuration</h3>
        <p>Name: ${siteName}</p>
        <p>URL: ${siteUrl}</p>
      </div>
      
      <div class="alert alert-info">
        Click "Install" to complete the installation. This may take a few moments.
      </div>
    `;
  }
  
  // Perform installation
  async function performInstallation() {
    const spinner = document.getElementById('install-spinner');
    const messageDiv = document.getElementById('install-message');
    
    spinner.classList.remove('hidden');
    messageDiv.innerHTML = '<div class="mt-4">Installing... Please wait.</div>';
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    
    try {
      const response = await fetch('/api/setup/install', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        messageDiv.innerHTML = '<div class="alert alert-success mt-4">Installation completed successfully!</div>';
        setTimeout(() => {
          goToStep(steps.indexOf('complete'));
        }, 1000);
        return true;
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger mt-4">${data.message}</div>`;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        return false;
      }
    } catch (error) {
      console.error('Error during installation:', error);
      messageDiv.innerHTML = '<div class="alert alert-danger mt-4">Error during installation. Please try again.</div>';
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      return false;
    } finally {
      spinner.classList.add('hidden');
    }
  }
});
