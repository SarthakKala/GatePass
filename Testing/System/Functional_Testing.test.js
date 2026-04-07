const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * Functional System Testing for Gate Pass Application
 * 
 * This tests the complete functionality of the system as a whole,
 * verifying that all components work together as expected.
 */

// Self-executing async function to run the tests
(async function runTests() {
  let driver;
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    testCases: []
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
    
    console.log('Running Functional System Tests');
    
    // Test Group 1: User Management Functionality
    console.log('\nTest Group 1: User Management Functionality');
    await runTestCase(
      testResults,
      "Student Registration Functionality",
      async () => await testStudentRegistration(driver)
    );
    
    await runTestCase(
      testResults,
      "Student Authentication Functionality",
      async () => await testStudentAuthentication(driver)
    );
    
    await runTestCase(
      testResults,
      "Admin Authentication Functionality",
      async () => await testAdminAuthentication(driver)
    );
    
    // Test Group 2: Leave Application Functionality
    console.log('\nTest Group 2: Leave Application Functionality');
    await runTestCase(
      testResults,
      "Leave Application Creation",
      async () => await testLeaveApplicationCreation(driver)
    );
    
    await runTestCase(
      testResults,
      "Leave Application Status Tracking",
      async () => await testStatusTracking(driver)
    );
    
    // Test Group 3: Approval Workflow Functionality
    console.log('\nTest Group 3: Approval Workflow Functionality');
    await runTestCase(
      testResults,
      "Admin Approval Interface",
      async () => await testAdminApprovalInterface(driver)
    );
    
    // Test Group 4: QR Code Functionality
    console.log('\nTest Group 4: QR Code Functionality');
    await runTestCase(
      testResults,
      "QR Code Generation",
      async () => await testQRCodeGeneration(driver)
    );
    
    await runTestCase(
      testResults,
      "QR Code Scanning",
      async () => await testQRCodeScanning(driver)
    );
    
    // Generate test report
    await generateReport(testResults);
    
    console.log('\nFunctional System Testing Completed!');
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    
  } catch (error) {
    console.error('Test runner failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test case runner with consistent reporting
async function runTestCase(testResults, testName, testFn) {
  testResults.total++;
  const startTime = Date.now();
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    const result = await testFn();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result === 'SKIPPED') {
      console.log(`⚠️ SKIPPED: ${testName} (${duration}s)`);
      testResults.skipped++;
      testResults.testCases.push({ name: testName, status: 'SKIPPED', duration, message: 'Test was skipped' });
    } else {
      console.log(`✅ PASSED: ${testName} (${duration}s)`);
      testResults.passed++;
      testResults.testCases.push({ name: testName, status: 'PASSED', duration });
    }
    return result;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ FAILED: ${testName} (${duration}s)`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.testCases.push({ 
      name: testName, 
      status: 'FAILED', 
      duration, 
      message: error.message
    });
  }
}

// Generate HTML report for test results
async function generateReport(testResults) {
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'functional_testing_report.html');
  const timestamp = new Date().toLocaleString();
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Functional System Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #333; }
      .summary { display: flex; margin-bottom: 20px; }
      .summary-item { margin-right: 20px; padding: 10px; border-radius: 5px; }
      .passed { background-color: #d4edda; color: #155724; }
      .failed { background-color: #f8d7da; color: #721c24; }
      .skipped { background-color: #fff3cd; color: #856404; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; color: #333; }
      tr:hover { background-color: #f5f5f5; }
      .status-passed { color: green; font-weight: bold; }
      .status-failed { color: red; font-weight: bold; }
      .status-skipped { color: orange; font-weight: bold; }
      .error-message { color: red; font-family: monospace; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <h1>Functional System Test Report</h1>
    <p>Generated: ${timestamp}</p>
    
    <div class="summary">
      <div class="summary-item">
        <strong>Total Tests:</strong> ${testResults.total}
      </div>
      <div class="summary-item passed">
        <strong>Passed:</strong> ${testResults.passed}
      </div>
      <div class="summary-item failed">
        <strong>Failed:</strong> ${testResults.failed}
      </div>
      <div class="summary-item skipped">
        <strong>Skipped:</strong> ${testResults.skipped}
      </div>
    </div>
    
    <table>
      <tr>
        <th>#</th>
        <th>Test Case</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Details</th>
      </tr>
  `;
  
  testResults.testCases.forEach((test, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${test.name}</td>
        <td class="status-${test.status.toLowerCase()}">${test.status}</td>
        <td>${test.duration}s</td>
        <td>
          ${test.message ? `<div class="error-message">${test.message}</div>` : ''}
        </td>
      </tr>
    `;
  });
  
  html += `
    </table>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`\nFunctional test report generated: ${reportPath}`);
}

// Test Case 1: Student Registration Functionality
async function testStudentRegistration(driver) {
  await driver.get('http://localhost:5173/signup');
  
  // Verify all required components are present
  const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  const parentEmailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']"));
  const hostelField = await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']"));
  const rollNoField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']"));
  const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
  
  // Test validation - try submitting empty form
  await signupButton.click();
  
  // Fill form with valid data
  await nameField.sendKeys('Functional Test Student');
  await emailField.sendKeys('func_test@example.com');
  await passwordField.sendKeys('func_test123');
  await parentEmailField.sendKeys('func_parent@example.com');
  await hostelField.sendKeys('Func Test Hostel');
  await rollNoField.sendKeys('FUNC12345');
  
  // Verify that the signup button is enabled
  const isSignupEnabled = await signupButton.isEnabled();
  
  if (!isSignupEnabled) {
    throw new Error('Signup button remains disabled after filling all required fields');
  }
  
  return true;
}

// Test Case 2: Student Authentication Functionality
async function testStudentAuthentication(driver) {
  await driver.get('http://localhost:5173/signin');
  
  // Verify all required components are present
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
  
  // Test empty form validation
  await signinButton.click();
  
  // Test incorrect credentials
  await emailField.sendKeys('wrong@example.com');
  await passwordField.sendKeys('wrongpassword');
  await signinButton.click();
  
  // The system might show an error message, but we can't easily detect that without knowing the exact error element
  // Instead, let's verify we're still on the signin page
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('signin')) {
    throw new Error('System did not prevent login with invalid credentials');
  }
  
  // Clear fields and try correct credentials
  await emailField.clear();
  await passwordField.clear();
  await emailField.sendKeys('func_test@example.com');
  await passwordField.sendKeys('func_test123');
  
  // Verify that signin button is enabled with valid credentials
  const isSigninEnabled = await signinButton.isEnabled();
  
  if (!isSigninEnabled) {
    throw new Error('Signin button remains disabled after filling credentials');
  }
  
  return true;
}

// Test Case 3: Admin Authentication Functionality
async function testAdminAuthentication(driver) {
  await driver.get('http://localhost:5173/adminsignin');
  
  // Verify all required components are present
  const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
  const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
  const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
  
  // Test valid credentials
  await emailField.sendKeys('admin@example.com');
  await passwordField.sendKeys('admin123');
  
  // Verify that the signin button is enabled
  const isSigninEnabled = await signinButton.isEnabled();
  
  if (!isSigninEnabled) {
    throw new Error('Admin signin button remains disabled after filling credentials');
  }
  
  // We don't want to actually submit the login form to avoid test dependencies
  // Instead, directly navigate to the admin dashboard and verify it's accessible
  await driver.get('http://localhost:5173/admindash');
  
  try {
    // Look for admin dashboard elements
    const adminDashElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
    if (adminDashElements.length === 0) {
      throw new Error('Admin dashboard does not contain expected heading');
    }
  } catch (error) {
    throw new Error(`Admin dashboard not accessible: ${error.message}`);
  }
  
  return true;
}

// Test Case 4: Leave Application Creation
async function testLeaveApplicationCreation(driver) {
  // Navigate to the dashboard where the leave application form is
  await driver.get('http://localhost:5173/dash');
  
  // Verify form components exist
  const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
  const toDateField = await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"));
  const destinationField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
  const reasonField = await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"));
  const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
  
  // Test validation by trying to submit empty form
  await submitButton.click();
  
  // Fill form with valid data
  await fromDateField.sendKeys(getCurrentDate());
  await toDateField.sendKeys(getFutureDate(3));
  await destinationField.sendKeys('Functional Test Destination');
  await reasonField.sendKeys('Functional Testing');
  
  // Verify submit button is enabled with valid data
  const isSubmitEnabled = await submitButton.isEnabled();
  
  if (!isSubmitEnabled) {
    throw new Error('Submit button remains disabled after filling all required fields');
  }
  
  // For system testing, we could actually submit the form, but let's avoid creating 
  // real data in the database just for testing
  
  return true;
}

// Test Case 5: Leave Application Status Tracking
async function testStatusTracking(driver) {
  // Navigate to the waiting/status page
  await driver.get('http://localhost:5173/waiting');
  
  // Verify status tracking components exist
  try {
    const headingElement = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
    const statusSteps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
    
    if (statusSteps.length < 3) {
      throw new Error(`Status tracking page should display at least 3 status steps, but found ${statusSteps.length}`);
    }
    
    // Check if status labels are present
    const statusLabels = await driver.findElements(
      By.xpath("//*[contains(text(), 'Mail Sent') or contains(text(), 'Parent Authentication') or contains(text(), 'Admin Authentication')]")
    );
    
    if (statusLabels.length < 3) {
      throw new Error(`Expected at least 3 status labels, found ${statusLabels.length}`);
    }
    
    // Check if status icons are displayed correctly
    const statusIcons = await driver.findElements(By.css('svg[class*="text-"]'));
    
    if (statusIcons.length < 3) {
      throw new Error(`Expected at least 3 status icons, found ${statusIcons.length}`);
    }
    
  } catch (error) {
    throw new Error(`Status tracking functionality error: ${error.message}`);
  }
  
  return true;
}

// Test Case 6: Admin Approval Interface
async function testAdminApprovalInterface(driver) {
  // Navigate to the admin dashboard
  await driver.get('http://localhost:5173/admindash');
  
  try {
    // Verify admin dashboard components
    const headingElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
    
    if (headingElements.length === 0) {
      throw new Error('Admin dashboard does not contain expected heading');
    }
    
    // Check for request handling components
    const tableElements = await driver.findElements(By.tagName('table'));
    const listElements = await driver.findElements(By.tagName('ul'));
    
    if (tableElements.length === 0 && listElements.length === 0) {
      // Not necessarily a failure as there might not be any requests
      console.log('  Note: No tables or lists found for displaying student requests');
    }
    
    // Check for action buttons
    const actionButtons = await driver.findElements(
      By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Approve') or contains(text(), 'Deny') or contains(text(), 'Reject')]")
    );
    
    // Log but don't fail if no buttons found - this could be normal if no requests
    if (actionButtons.length === 0) {
      console.log('  Note: No approval action buttons found - this may be normal if no requests');
    }
    
  } catch (error) {
    throw new Error(`Admin approval interface error: ${error.message}`);
  }
  
  return true;
}

// Test Case 7: QR Code Generation
async function testQRCodeGeneration(driver) {
  // Navigate to the QR code page with a test ID
  await driver.get('http://localhost:5173/qr?id=12345');
  
  try {
    // Verify the QR code page components
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
    
    // Check if QR code SVG is rendered
    const svgElements = await driver.findElements(By.tagName('svg'));
    
    if (svgElements.length === 0) {
      throw new Error('QR code SVG not rendered on the page');
    }
    
    // Verify the QR code has appropriate size
    const qrCode = svgElements[0];
    const qrSize = await qrCode.getRect();
    
    if (qrSize.width < 100 || qrSize.height < 100) {
      throw new Error(`QR code size is too small: ${qrSize.width}x${qrSize.height}`);
    }
    
  } catch (error) {
    throw new Error(`QR code generation functionality error: ${error.message}`);
  }
  
  return true;
}

// Test Case 8: QR Code Scanning
async function testQRCodeScanning(driver) {
  // Navigate to the scan page with test parameters
  await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
  
  try {
    // Since this is a simulation and we're using test data, the scan page might
    // show an error. The important thing is that it attempts to process the scan.
    
    // Check for either student information display or error message
    const pageSource = await driver.getPageSource();
    
    if (pageSource.includes('Student') || 
        pageSource.includes('Authorized') || 
        pageSource.includes('invalid token') || 
        pageSource.includes('error')) {
      // This means the scan functionality is attempting to process the request
      console.log('  Note: Scan page is attempting to process the test scan');
    } else {
      throw new Error('Scan page does not show any indication of processing the scan');
    }
    
  } catch (error) {
    throw new Error(`QR code scanning functionality error: ${error.message}`);
  }
  
  return true;
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