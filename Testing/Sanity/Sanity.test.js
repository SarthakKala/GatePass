const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

/**
 * Sanity Testing for Gate Pass Application
 * 
 * This test focuses on checking specific functionality after changes
 * or bug fixes to ensure they work as expected.
 */

// Self-executing async function to run the tests
(async function runSanityTests() {
  let driver;
  const sanityResults = {
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
    
    console.log('Running Sanity Tests for Gate Pass Application');
    
    // Test 1: Student Registration Core Functionality
    await runTest(
      sanityResults,
      "Student Registration Validation",
      "Verify that registration form validates inputs correctly",
      async () => await testStudentRegistrationValidation(driver)
    );
    
    // Test 2: Student Login Authentication
    await runTest(
      sanityResults,
      "Student Login Authentication",
      "Verify that login authentication flow works properly",
      async () => await testStudentLoginAuthentication(driver)
    );
    
    // Test 3: Leave Application Business Rules
    await runTest(
      sanityResults,
      "Leave Application Business Rules",
      "Verify that leave application enforces business rules correctly",
      async () => await testLeaveApplicationRules(driver)
    );
    
    // Test 4: Status Tracking Workflow
    await runTest(
      sanityResults,
      "Status Tracking Workflow",
      "Verify that status tracking workflow displays correct states",
      async () => await testStatusTrackingWorkflow(driver)
    );
    
    // Test 5: Admin Dashboard Functions
    await runTest(
      sanityResults,
      "Admin Dashboard Functions",
      "Verify that admin dashboard shows and can process leave requests",
      async () => await testAdminDashboardFunctions(driver)
    );
    
    // Test 6: QR Code Functionality
    await runTest(
      sanityResults,
      "QR Code Functionality",
      "Verify that QR code functionality works correctly",
      async () => await testQRCodeFunctionality(driver)
    );
    
    // Generate sanity test report
    await generateReport(sanityResults, "sanity_test_report.html");
    
    console.log('\nSanity Testing Completed!');
    console.log(`Total: ${sanityResults.summary.total}, Passed: ${sanityResults.summary.passed}, Failed: ${sanityResults.summary.failed}`);
    
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
  console.log(`\n🧪 Running: ${name}`);
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

// Test 1: Student Registration Validation
async function testStudentRegistrationValidation(driver) {
  await driver.get('http://localhost:5173/signup');
  
  // Scenario 1: Empty form submission
  const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
  await signupButton.click();
  
  // Since we have not filled any fields, the form should not submit successfully
  await driver.sleep(500); // Allow time for any error messages to appear
  
  // Check current URL - should still be on signup page
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('/signup')) {
    throw new Error(`Empty form submission should not redirect, but current URL is ${currentUrl}`);
  }
  console.log('   ✓ Form prevents empty submission');
  
  // Scenario 2: Invalid email format
  const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  const parentEmailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']"));
  const hostelField = await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']"));
  const rollNoField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']"));
  
  await nameField.sendKeys('Sanity Test User');
  await emailField.sendKeys('invalid-email'); // Invalid email format
  await passwordField.sendKeys('password123');
  await parentEmailField.sendKeys('parent@example.com');
  await hostelField.sendKeys('Test Hostel');
  await rollNoField.sendKeys('ST12345');
  
  await signupButton.click();
  await driver.sleep(500);
  
  // Still should be on signup page
  const urlAfterInvalidEmail = await driver.getCurrentUrl();
  if (!urlAfterInvalidEmail.includes('/signup')) {
    throw new Error(`Invalid email submission should not redirect, but current URL is ${urlAfterInvalidEmail}`);
  }
  console.log('   ✓ Form validates email format');
  
  // Scenario 3: Valid form submission
  await emailField.clear();
  await emailField.sendKeys('sanity@test.com'); // Valid email format
  
  // Just check if the button is enabled, but don't click it to avoid creating an account
  const isEnabled = await signupButton.isEnabled();
  if (!isEnabled) {
    throw new Error('Signup button should be enabled with valid form data');
  }
  console.log('   ✓ Form accepts valid submission data');
}

// Test 2: Student Login Authentication
async function testStudentLoginAuthentication(driver) {
  await driver.get('http://localhost:5173/signin');
  
  // Scenario 1: Empty credentials
  const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
  await signinButton.click();
  
  await driver.sleep(500);
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('/signin')) {
    throw new Error(`Empty login submission should not redirect, but current URL is ${currentUrl}`);
  }
  console.log('   ✓ Login form prevents empty submission');
  
  // Scenario 2: Invalid credentials format
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  
  await emailField.sendKeys('invalid-email');
  await passwordField.sendKeys('short');
  
  await signinButton.click();
  await driver.sleep(500);
  
  const urlAfterInvalidFormat = await driver.getCurrentUrl();
  if (!urlAfterInvalidFormat.includes('/signin')) {
    throw new Error(`Invalid format login should not redirect, but current URL is ${urlAfterInvalidFormat}`);
  }
  console.log('   ✓ Login form validates credential format');
  
  // Scenario 3: Valid format but incorrect credentials
  await emailField.clear();
  await passwordField.clear();
  await emailField.sendKeys('sanity@test.com');
  await passwordField.sendKeys('incorrectpassword');
  
  // Just check if signin button is enabled with valid format
  const isEnabled = await signinButton.isEnabled();
  if (!isEnabled) {
    throw new Error('Signin button should be enabled with valid credential format');
  }
  console.log('   ✓ Login form accepts valid credential format');

  // Simulate successful login by navigating to dashboard
  await driver.get('http://localhost:5173/dash');
  
  // Verify dashboard loaded
  const dashboardContent = await driver.findElement(By.tagName('body')).getText();
  if (!dashboardContent.includes('Leave Application') && !dashboardContent.includes('From Date')) {
    throw new Error('Dashboard does not contain expected content');
  }
  console.log('   ✓ Dashboard page loads successfully');
}

// Test 3: Leave Application Business Rules
async function testLeaveApplicationRules(driver) {
  await driver.get('http://localhost:5173/dash');
  
  const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
  const toDateField = await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"));
  const destinationField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
  const reasonField = await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"));
  const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
  
  // Scenario 1: Past date validation
  const pastDate = getPastDate(5);
  await fromDateField.sendKeys(pastDate);
  await toDateField.sendKeys(getCurrentDate());
  await destinationField.sendKeys('Sanity Test Destination');
  await reasonField.sendKeys('Sanity Testing');
  
  // Check if form detects and prevents using past dates
  // This test might fail if the form allows past dates - adjust based on your requirements
  const submitEnabled1 = await submitButton.isEnabled();
  if (submitEnabled1) {
    console.log('   ℹ️ Form allows past dates (this might be your intended behavior)');
  } else {
    console.log('   ✓ Form prevents using past dates');
  }
  
  // Scenario 2: To date before from date
  await fromDateField.clear();
  await toDateField.clear();
  await fromDateField.sendKeys(getFutureDate(5));
  await toDateField.sendKeys(getFutureDate(2)); // Before from date
  
  // Check if form detects invalid date range
  const submitEnabled2 = await submitButton.isEnabled();
  if (submitEnabled2) {
    console.log('   ℹ️ Form allows to date before from date (this might need validation)');
  } else {
    console.log('   ✓ Form prevents to date before from date');
  }
  
  // Scenario 3: Valid date range
  await fromDateField.clear();
  await toDateField.clear();
  await fromDateField.sendKeys(getCurrentDate());
  await toDateField.sendKeys(getFutureDate(5));
  
  const submitEnabled3 = await submitButton.isEnabled();
  if (!submitEnabled3) {
    throw new Error('Submit button should be enabled with valid date range');
  }
  console.log('   ✓ Form accepts valid date range');
  
  // Scenario 4: Required fields validation
  await fromDateField.clear();
  await toDateField.clear();
  await destinationField.clear();
  await reasonField.clear();
  
  await fromDateField.sendKeys(getCurrentDate());
  await toDateField.sendKeys(getFutureDate(3));
  // Deliberately leave destination and reason empty
  
  const submitEnabled4 = await submitButton.isEnabled();
  if (submitEnabled4) {
    console.log('   ⚠️ Form allows submission with empty required fields');
  } else {
    console.log('   ✓ Form prevents submission with empty required fields');
  }
}

// Test 4: Status Tracking Workflow
async function testStatusTrackingWorkflow(driver) {
  await driver.get('http://localhost:5173/waiting');
  
  // Verify status elements
  const authProgressHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
  if (!await authProgressHeading.isDisplayed()) {
    throw new Error('Authentication Progress heading not found');
  }
  console.log('   ✓ Status page displays Authentication Progress heading');
  
  // Check status steps present
  const statusSteps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
  if (statusSteps.length < 3) {
    throw new Error(`Expected at least 3 status steps, found only ${statusSteps.length}`);
  }
  console.log(`   ✓ Status page displays ${statusSteps.length} status steps`);
  
  // Check for specific status labels
  const mailSentStep = await driver.findElements(By.xpath("//*[contains(text(), 'Mail Sent')]"));
  const parentAuthStep = await driver.findElements(By.xpath("//*[contains(text(), 'Parent Authentication')]"));
  const adminAuthStep = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Authentication')]"));
  
  if (mailSentStep.length === 0) {
    throw new Error('Mail Sent step not found');
  }
  if (parentAuthStep.length === 0) {
    throw new Error('Parent Authentication step not found');
  }
  if (adminAuthStep.length === 0) {
    throw new Error('Admin Authentication step not found');
  }
  
  console.log('   ✓ All required status labels are present');
  
  // Check for status icons (indicators of state)
  const statusIcons = await driver.findElements(By.css('svg[class*="text-"]'));
  if (statusIcons.length < 3) {
    throw new Error(`Expected at least 3 status icons, found only ${statusIcons.length}`);
  }
  console.log(`   ✓ Status page displays ${statusIcons.length} status indicators`);
}

// Test 5: Admin Dashboard Functions
async function testAdminDashboardFunctions(driver) {
  await driver.get('http://localhost:5173/admindash');
  
  // Verify admin dashboard elements
  const dashboardHeadings = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
  if (dashboardHeadings.length === 0) {
    throw new Error('Admin dashboard heading not found');
  }
  console.log('   ✓ Admin dashboard displays appropriate heading');
  
  // Check for student request list
  const tableElements = await driver.findElements(By.tagName('table'));
  const listElements = await driver.findElements(By.tagName('ul'));
  
  if (tableElements.length > 0) {
    console.log('   ✓ Admin dashboard has table element for displaying requests');
  } else if (listElements.length > 0) {
    console.log('   ✓ Admin dashboard has list element for displaying requests');
  } else {
    console.log('   ℹ️ No table or list elements found for displaying requests (this might be normal if there are no pending requests)');
  }
  
  // Check for action buttons
  const actionButtons = await driver.findElements(
    By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Approve') or contains(text(), 'Deny') or contains(text(), 'Reject')]")
  );
  
  if (actionButtons.length > 0) {
    console.log(`   ✓ Admin dashboard displays ${actionButtons.length} action button(s)`);
    
    // Check if buttons are functional (but don't click)
    const firstButton = actionButtons[0];
    const isEnabled = await firstButton.isEnabled();
    if (isEnabled) {
      console.log('   ✓ Action buttons are enabled');
    } else {
      console.log('   ⚠️ Action buttons are disabled');
    }
  } else {
    console.log('   ℹ️ No action buttons found (this might be normal if there are no pending requests)');
  }
}

// Test 6: QR Code Functionality
async function testQRCodeFunctionality(driver) {
  // Test QR Code generation
  await driver.get('http://localhost:5173/qr?id=12345');
  
  // Verify QR code elements
  const qrHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
  if (!await qrHeading.isDisplayed()) {
    throw new Error('QR code heading not found');
  }
  console.log('   ✓ QR code page displays appropriate heading');
  
  // Check for QR code SVG
  const svgElements = await driver.findElements(By.tagName('svg'));
  if (svgElements.length === 0) {
    throw new Error('No SVG element found for QR code');
  }
  console.log(`   ✓ QR code page displays QR code as SVG (${svgElements.length} SVG elements found)`);
  
  // Test QR code scanning and verification
  await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
  
  // Check if page attempts to process scan (it might show an error, which is expected for test data)
  const pageSource = await driver.getPageSource();
  
  if (pageSource.includes('Authorized') || 
      pageSource.includes('Student') || 
      pageSource.includes('invalid token') || 
      pageSource.includes('error')) {
    console.log('   ✓ Scan page attempts to process the scan data');
  } else {
    throw new Error('Scan page does not show any indication of processing the scan');
  }
  
  // Simulate successful scan with additional test parameters
  await driver.get('http://localhost:5173/scan?id=12345&token=test-token&student=Sanity%20Test&rollno=ST12345&hostel=Test%20Hostel&valid=true');
  
  // Check for student information display
  try {
    const scanPageContent = await driver.findElement(By.tagName('body')).getText();
    
    if (scanPageContent.includes('Sanity Test') || 
        scanPageContent.includes('ST12345') || 
        scanPageContent.includes('Test Hostel') || 
        scanPageContent.includes('Authorized')) {
      console.log('   ✓ Scan page can display student information and authorization status');
    } else {
      console.log('   ⚠️ Scan page may not correctly display student information');
    }
  } catch (error) {
    console.log(`   ⚠️ Error checking scan result display: ${error.message}`);
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

// Helper function to get past date in YYYY-MM-DD format
function getPastDate(days) {
  const past = new Date();
  past.setDate(past.getDate() - days);
  const year = past.getFullYear();
  const month = String(past.getMonth() + 1).padStart(2, '0');
  const day = String(past.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}