const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

/**
 * Smoke Testing for Gate Pass Application
 * 
 * This test verifies that the critical parts of the application are working
 * at a basic level (build verification testing).
 */

// Self-executing async function to run the tests
(async function runSmokeTests() {
  let driver;
  const smokeResults = {
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    },
    timestamp: new Date().toISOString()
  };
  
  try {
    // Set up Chrome options
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment for headless testing
    
    // Initialize the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('Running Smoke Tests for Gate Pass Application');
    
    // Test 1: Application Navigation and Loading
    await runTest(
      smokeResults,
      "Basic Navigation",
      "Verify that all main application pages load without errors",
      async () => await testBasicNavigation(driver)
    );
    
    // Test 2: Student Registration Form
    await runTest(
      smokeResults,
      "Student Registration Form",
      "Verify that the student registration form is accessible and functional",
      async () => await testStudentRegistrationForm(driver)
    );
    
    // Test 3: Student Login Form
    await runTest(
      smokeResults,
      "Student Login Form",
      "Verify that the student login form is accessible and functional",
      async () => await testStudentLoginForm(driver)
    );
    
    // Test 4: Admin Login Form
    await runTest(
      smokeResults,
      "Admin Login Form",
      "Verify that the admin login form is accessible and functional",
      async () => await testAdminLoginForm(driver)
    );
    
    // Test 5: Leave Application Form
    await runTest(
      smokeResults,
      "Leave Application Form",
      "Verify that the leave application form is accessible and functional",
      async () => await testLeaveApplicationForm(driver)
    );
    
    // Test 6: Leave Status Page
    await runTest(
      smokeResults,
      "Leave Status Page",
      "Verify that the leave status page is accessible and contains status components",
      async () => await testLeaveStatusPage(driver)
    );
    
    // Test 7: QR Code Generation
    await runTest(
      smokeResults,
      "QR Code Generation",
      "Verify that the QR code generation page is accessible and displays a QR code",
      async () => await testQRCodeGeneration(driver)
    );
    
    // Generate smoke test report
    await generateReport(smokeResults, "smoke_test_report.html");
    
    console.log('\nSmoke Testing Completed!');
    console.log(`Total: ${smokeResults.summary.total}, Passed: ${smokeResults.summary.passed}, Failed: ${smokeResults.summary.failed}`);
    
  } catch (error) {
    console.error('Test runner failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test wrapper function to run individual tests
async function runTest(results, name, description, testFn) {
  results.summary.total++;
  console.log(`\n🔍 Running: ${name}`);
  console.log(`   Description: ${description}`);
  
  const test = {
    name,
    description,
    status: 'RUNNING',
    startTime: Date.now()
  };
  
  try {
    await testFn();
    test.status = 'PASSED';
    results.summary.passed++;
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    test.status = 'FAILED';
    test.error = error.message;
    results.summary.failed++;
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    
    // Take screenshot on failure
    try {
      const screenshotDir = path.join(__dirname, 'reports', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshot = await driver.takeScreenshot();
      const screenshotPath = path.join(screenshotDir, `${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.png`);
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      test.screenshot = path.basename(screenshotPath);
    } catch (screenshotError) {
      console.log(`   Could not save screenshot: ${screenshotError.message}`);
    }
  }
  
  test.endTime = Date.now();
  test.duration = (test.endTime - test.startTime) / 1000;
  results.tests.push(test);
}

// Test 1: Basic Navigation
async function testBasicNavigation(driver) {
  const routes = [
    { path: '/', name: 'Home Page' },
    { path: '/signup', name: 'Student Signup Page' },
    { path: '/signin', name: 'Student Signin Page' },
    { path: '/adminsignin', name: 'Admin Signin Page' },
    { path: '/dash', name: 'Student Dashboard' },
    { path: '/admindash', name: 'Admin Dashboard' },
    { path: '/waiting', name: 'Status Waiting Page' },
    { path: '/qr', name: 'QR Code Page' }
  ];
  
  for (const route of routes) {
    await driver.get(`http://localhost:5173${route.path}`);
    await driver.wait(async () => {
      return await driver.executeScript('return document.readyState') === 'complete';
    }, 5000);
    
    // Check if page loaded without errors
    const body = await driver.findElement(By.tagName('body'));
    const bodyText = await body.getText();
    
    if (bodyText.includes('Error') && bodyText.includes('stack trace')) {
      throw new Error(`${route.name} (${route.path}) loaded with errors: ${bodyText.substring(0, 100)}...`);
    }
    
    console.log(`   ✓ Successfully loaded ${route.name}: ${route.path}`);
  }
}

// Test 2: Student Registration Form
async function testStudentRegistrationForm(driver) {
  await driver.get('http://localhost:5173/signup');
  
  // Verify all required form components are present
  const requiredFields = [
    { xpath: "//input[@placeholder='Enter Your Name']", name: "Name field" },
    { xpath: "//input[@placeholder='Enter Your Email']", name: "Email field" },
    { xpath: "//input[@placeholder='Enter Your Password']", name: "Password field" },
    { xpath: "//input[@placeholder='Enter Parents Email']", name: "Parent Email field" },
    { xpath: "//input[@placeholder='Enter Hostel Name']", name: "Hostel field" },
    { xpath: "//input[@placeholder='Enter Your Roll No']", name: "Roll No field" },
    { xpath: "//button[contains(text(), 'Signup')]", name: "Signup button" }
  ];
  
  for (const field of requiredFields) {
    const element = await driver.findElement(By.xpath(field.xpath));
    if (!await element.isDisplayed()) {
      throw new Error(`${field.name} is not displayed on the registration form`);
    }
    console.log(`   ✓ ${field.name} is displayed properly`);
  }
  
  // Test basic form interaction
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  await emailField.sendKeys('smoke@test.com');
  const emailValue = await emailField.getAttribute('value');
  
  if (emailValue !== 'smoke@test.com') {
    throw new Error(`Form input not working correctly. Expected 'smoke@test.com', got '${emailValue}'`);
  }
}

// Test 3: Student Login Form
async function testStudentLoginForm(driver) {
  await driver.get('http://localhost:5173/signin');
  
  // Verify login form components are present
  const requiredFields = [
    { xpath: "//input[@placeholder='Enter Your Email']", name: "Email field" },
    { xpath: "//input[@placeholder='Enter Your Password']", name: "Password field" },
    { xpath: "//button[contains(text(), 'Signin')]", name: "Signin button" }
  ];
  
  for (const field of requiredFields) {
    const element = await driver.findElement(By.xpath(field.xpath));
    if (!await element.isDisplayed()) {
      throw new Error(`${field.name} is not displayed on the login form`);
    }
    console.log(`   ✓ ${field.name} is displayed properly`);
  }
  
  // Test form validation
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
  
  await emailField.sendKeys('smoke@test.com');
  await passwordField.sendKeys('smoketest');
  
  const isEnabled = await signinButton.isEnabled();
  if (!isEnabled) {
    throw new Error('Signin button is not enabled after filling credentials');
  }
}

// Test 4: Admin Login Form
async function testAdminLoginForm(driver) {
  await driver.get('http://localhost:5173/adminsignin');
  
  // Verify admin login form components are present
  const requiredFields = [
    { xpath: "//input[@placeholder='Enter Your Email']", name: "Email field" },
    { xpath: "//input[@placeholder='Enter Your Password']", name: "Password field" },
    { xpath: "//button[contains(text(), 'Signin')]", name: "Signin button" }
  ];
  
  for (const field of requiredFields) {
    const element = await driver.findElement(By.xpath(field.xpath));
    if (!await element.isDisplayed()) {
      throw new Error(`${field.name} is not displayed on the admin login form`);
    }
    console.log(`   ✓ ${field.name} is displayed properly`);
  }
  
  // Test form validation
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  
  await emailField.sendKeys('admin@test.com');
  await passwordField.sendKeys('admintest');
  
  const pageSource = await driver.getPageSource();
  if (pageSource.includes('Invalid email') || pageSource.includes('Invalid password')) {
    throw new Error('Admin login form shows validation errors for valid input format');
  }
}

// Test 5: Leave Application Form
async function testLeaveApplicationForm(driver) {
  await driver.get('http://localhost:5173/dash');
  
  // Verify leave application form components are present
  const requiredFields = [
    { xpath: "//input[@placeholder='Select From Date']", name: "From Date field" },
    { xpath: "//input[@placeholder='Select To Date']", name: "To Date field" },
    { xpath: "//input[@placeholder='Enter Destination']", name: "Destination field" },
    { xpath: "//input[@placeholder='Enter Reason']", name: "Reason field" },
    { xpath: "//button[contains(text(), 'Submit')]", name: "Submit button" }
  ];
  
  for (const field of requiredFields) {
    const element = await driver.findElement(By.xpath(field.xpath));
    if (!await element.isDisplayed()) {
      throw new Error(`${field.name} is not displayed on the leave application form`);
    }
    console.log(`   ✓ ${field.name} is displayed properly`);
  }
  
  // Test form interaction
  const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
  const toDateField = await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"));
  const destField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
  const reasonField = await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"));
  
  await fromDateField.sendKeys(getCurrentDate());
  await toDateField.sendKeys(getFutureDate(3));
  await destField.sendKeys('Smoke Test Destination');
  await reasonField.sendKeys('Smoke Testing');
  
  const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
  const isEnabled = await submitButton.isEnabled();
  if (!isEnabled) {
    throw new Error('Submit button is not enabled after filling the form');
  }
}

// Test 6: Leave Status Page
async function testLeaveStatusPage(driver) {
  await driver.get('http://localhost:5173/waiting');
  
  // Verify status page components are present
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
    if (!await heading.isDisplayed()) {
      throw new Error('Status page heading is not displayed');
    }
    console.log('   ✓ Status page heading is displayed properly');
    
    // Check for status steps
    const statusSteps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
    if (statusSteps.length < 2) {
      throw new Error(`Expected at least 2 status steps, found ${statusSteps.length}`);
    }
    console.log(`   ✓ Found ${statusSteps.length} status steps`);
    
    // Check for status labels
    const statusLabels = await driver.findElements(
      By.xpath("//*[contains(text(), 'Mail Sent') or contains(text(), 'Parent Authentication') or contains(text(), 'Admin Authentication')]")
    );
    
    if (statusLabels.length < 2) {
      throw new Error(`Expected at least 2 status labels, found ${statusLabels.length}`);
    }
    console.log(`   ✓ Found ${statusLabels.length} status labels`);
    
  } catch (error) {
    throw new Error(`Status page verification failed: ${error.message}`);
  }
}

// Test 7: QR Code Generation
async function testQRCodeGeneration(driver) {
  // Navigate to QR code page with test parameter
  await driver.get('http://localhost:5173/qr?id=12345');
  
  try {
    // Verify QR code page heading
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
    if (!await heading.isDisplayed()) {
      throw new Error('QR code page heading is not displayed');
    }
    console.log('   ✓ QR code page heading is displayed properly');
    
    // Check for QR code SVG
    const svgElements = await driver.findElements(By.tagName('svg'));
    if (svgElements.length === 0) {
      throw new Error('No SVG element found for QR code');
    }
    console.log(`   ✓ Found ${svgElements.length} SVG element(s) for QR code`);
    
  } catch (error) {
    throw new Error(`QR code page verification failed: ${error.message}`);
  }
}

// Generate HTML report
async function generateReport(results, filename) {
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, filename);
  const timestamp = new Date().toLocaleString();
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${filename.replace('.html', '')} - Gate Pass Application</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
      h1 { color: #2c3e50; margin-bottom: 10px; }
      .summary { display: flex; gap: 20px; margin: 20px 0; }
      .summary-item { border-radius: 5px; padding: 10px 20px; }
      .total { background-color: #f8f9fa; border: 1px solid #dee2e6; }
      .passed { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      .failed { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      
      .test-case { margin-bottom: 15px; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; }
      .test-case.passed { border-left: 5px solid #28a745; }
      .test-case.failed { border-left: 5px solid #dc3545; }
      
      .test-header { display: flex; justify-content: space-between; align-items: center; }
      .test-title { margin: 0; }
      .test-status { font-weight: bold; }
      .status-passed { color: #28a745; }
      .status-failed { color: #dc3545; }
      
      .test-details { margin-top: 10px; }
      .test-description { margin: 5px 0; font-style: italic; color: #6c757d; }
      .test-duration { font-size: 0.9em; color: #6c757d; }
      .test-error { padding: 10px; background-color: #f8f9fa; border-left: 3px solid #dc3545; white-space: pre-wrap; }
      
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #ddd; }
      th { background-color: #f8f9fa; }
    </style>
  </head>
  <body>
    <h1>Gate Pass Application - ${filename.replace('.html', '')}</h1>
    <p>Report generated: ${timestamp}</p>
    
    <div class="summary">
      <div class="summary-item total">
        <strong>Total Tests:</strong> ${results.summary.total}
      </div>
      <div class="summary-item passed">
        <strong>Passed:</strong> ${results.summary.passed}
      </div>
      <div class="summary-item failed">
        <strong>Failed:</strong> ${results.summary.failed}
      </div>
    </div>
    
    <h2>Test Results</h2>
  `;
  
  // Add each test case result
  for (const test of results.tests) {
    html += `
    <div class="test-case ${test.status.toLowerCase()}">
      <div class="test-header">
        <h3 class="test-title">${test.name}</h3>
        <span class="test-status status-${test.status.toLowerCase()}">${test.status}</span>
      </div>
      <div class="test-details">
        <p class="test-description">${test.description}</p>
        <p class="test-duration">Duration: ${test.duration.toFixed(2)}s</p>
        ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
        ${test.screenshot ? `<p><a href="screenshots/${test.screenshot}" target="_blank">View Screenshot</a></p>` : ''}
      </div>
    </div>
    `;
  }
  
  html += `
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`\nReport generated: ${reportPath}`);
}

// Helper function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get future date in YYYY-MM-DD format
function getFutureDate(days) {
  const future = new Date();
  future.setDate(future.getDate() + days);
  const year = future.getFullYear();
  const month = String(future.getMonth() + 1).padStart(2, '0');
  const day = String(future.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}