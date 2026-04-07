const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Regression Testing for Gate Pass Application
 * 
 * This approach ensures that new changes haven't broken existing functionality.
 * We'll focus on critical paths and functionality that might be affected by changes.
 */

// Self-executing async function to run the tests
(async function runTests() {
  let driver;
  
  try {
    // Set up Chrome options
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment for headless testing
    
    // Initialize the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('Running Regression Testing');
    
    // Test 1: Critical User Authentication Flow
    console.log('\nTest 1: Critical User Authentication Flow');
    await testUserAuthenticationFlow(driver);
    
    // Test 2: Critical Admin Authentication Flow
    console.log('\nTest 2: Critical Admin Authentication Flow');
    await testAdminAuthenticationFlow(driver);
    
    // Test 3: Leave Application Submission Flow
    console.log('\nTest 3: Leave Application Submission Flow');
    await testLeaveApplicationSubmissionFlow(driver);
    
    // Test 4: QR Code Generation and Scan Flow
    console.log('\nTest 4: QR Code Generation and Scan Flow');
    await testQRCodeFlow(driver);
    
    console.log('\nAll regression tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test 1: Critical User Authentication Flow
async function testUserAuthenticationFlow(driver) {
  console.log("  Testing user authentication flow");
  
  // Step 1: Verify signup page functionality
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Verify all required form fields exist
    const formFields = await driver.findElements(By.xpath("//input[@placeholder]"));
    const formFieldCount = formFields.length;
    
    // We know there should be at least 6 fields (name, email, password, parent email, hostel, roll no)
    if (formFieldCount >= 6) {
      console.log(`  ✓ Signup form has expected fields (${formFieldCount} fields found)`);
    } else {
      console.log(`  ⚠️ Signup form may be missing fields (only ${formFieldCount} fields found)`);
    }
    
    // Verify signup button exists and is enabled when form is properly filled
    // This is a grey box test since we know the validation logic should allow submission only when all fields are filled
    
    // Fill valid data in all required fields
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Regression Test User');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('regression@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Test Hostel');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('RT12345');
    
    // Check if signup button is enabled
    const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
    const isSignupEnabled = await signupButton.isEnabled();
    
    if (isSignupEnabled) {
      console.log('  ✓ Signup button is enabled when form is properly filled');
    } else {
      console.log('  ✗ Signup button is not enabled despite form being filled');
    }
  } catch (error) {
    console.log(`  ✗ Error testing signup functionality: ${error.message}`);
  }
  
  // Step 2: Verify signin page functionality
  await driver.get('http://localhost:5173/signin');
  
  try {
    // Verify email and password fields exist
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    
    if (emailField && passwordField) {
      console.log('  ✓ Signin form has expected email and password fields');
    } else {
      console.log('  ✗ Signin form is missing expected fields');
    }
    
    // Fill valid credentials
    await emailField.sendKeys('regression@example.com');
    await passwordField.sendKeys('password123');
    
    // Check if signin button is enabled
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isSigninEnabled = await signinButton.isEnabled();
    
    if (isSigninEnabled) {
      console.log('  ✓ Signin button is enabled when form is properly filled');
    } else {
      console.log('  ✗ Signin button is not enabled despite form being filled');
    }
  } catch (error) {
    console.log(`  ✗ Error testing signin functionality: ${error.message}`);
  }
  
  // Step 3: Verify dashboard access and structure
  // This is simulating a successful login since we don't want to create real accounts
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Look for leave application form which should be on the dashboard
    const formElements = await driver.findElements(By.xpath("//input[@placeholder='Select From Date' or @placeholder='Select To Date']"));
    
    if (formElements.length >= 2) {
      console.log('  ✓ Dashboard contains expected leave application form');
    } else {
      console.log('  ✗ Dashboard is missing expected leave application form');
    }
  } catch (error) {
    console.log(`  ✗ Error accessing or testing dashboard: ${error.message}`);
  }
}

// Test 2: Critical Admin Authentication Flow
async function testAdminAuthenticationFlow(driver) {
  console.log("  Testing admin authentication flow");
  
  // Step 1: Verify admin signup page functionality
  await driver.get('http://localhost:5173/adminsignup');
  
  try {
    // Check if the form contains expected fields for admin signup
    const formFields = await driver.findElements(By.xpath("//input[@placeholder]"));
    
    // Grey box knowledge: Admin signup should have fields for email and password at minimum
    if (formFields.length >= 2) {
      console.log(`  ✓ Admin signup form has expected fields (${formFields.length} fields found)`);
    } else {
      console.log(`  ⚠️ Admin signup form may be missing fields (only ${formFields.length} fields found)`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin signup functionality: ${error.message}`);
  }
  
  // Step 2: Verify admin signin page functionality
  await driver.get('http://localhost:5173/adminsignin');
  
  try {
    // Verify email and password fields exist
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    
    if (emailField && passwordField) {
      console.log('  ✓ Admin signin form has expected email and password fields');
    } else {
      console.log('  ✗ Admin signin form is missing expected fields');
    }
    
    // Fill valid credentials
    await emailField.sendKeys('admin@example.com');
    await passwordField.sendKeys('admin123');
    
    // Check if signin button is enabled
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isSigninEnabled = await signinButton.isEnabled();
    
    if (isSigninEnabled) {
      console.log('  ✓ Admin signin button is enabled when form is properly filled');
    } else {
      console.log('  ✗ Admin signin button is not enabled despite form being filled');
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin signin functionality: ${error.message}`);
  }
  
  // Step 3: Verify admin dashboard access and structure
  await driver.get('http://localhost:5173/admindash');
  
  try {
    // Grey box knowledge: Admin dashboard should contain a heading and some student request elements
    const dashboardElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin')] | //h1[contains(text(), 'Dashboard')]"));
    
    if (dashboardElements.length > 0) {
      console.log('  ✓ Admin dashboard contains expected heading elements');
    } else {
      console.log('  ✗ Admin dashboard is missing expected heading elements');
    }
    
    // Look for allow/deny buttons that would be used for student requests
    const actionButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Allow')] | //button[contains(text(), 'Deny')] | //button[contains(text(), 'Approve')] | //button[contains(text(), 'Reject')]"));
    
    // We don't know if there are student requests, but the UI elements for actions should exist
    console.log(`  ℹ️ Found ${actionButtons.length} action buttons on admin dashboard`);
  } catch (error) {
    console.log(`  ✗ Error accessing or testing admin dashboard: ${error.message}`);
  }
}

// Test 3: Leave Application Submission Flow
async function testLeaveApplicationSubmissionFlow(driver) {
  console.log("  Testing leave application submission flow");
  
  // Step 1: Access dashboard page
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Fill in leave application form
    await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
    await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Regression Test Destination');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Regression Testing');
    
    // Check if submit button is enabled
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isSubmitEnabled = await submitButton.isEnabled();
    
    if (isSubmitEnabled) {
      console.log('  ✓ Submit button is enabled when leave application form is properly filled');
    } else {
      console.log('  ✗ Submit button is not enabled despite form being filled');
    }
    
    // Step 2: Check waiting page structure (where user would go after submission)
    await driver.get('http://localhost:5173/waiting');
    
    // Grey box knowledge: Waiting page shows status of parent and admin authentication
    const waitingElements = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
    
    if (waitingElements.length >= 2) {
      console.log('  ✓ Waiting page contains expected status elements');
    } else {
      console.log('  ✗ Waiting page is missing expected status elements');
    }
    
    // Check for specific status elements we know should exist
    const statusLabels = await driver.findElements(By.xpath("//*[contains(text(), 'Mail Sent')] | //*[contains(text(), 'Parent Authentication')] | //*[contains(text(), 'Admin Authentication')]"));
    
    if (statusLabels.length >= 3) {
      console.log('  ✓ Waiting page contains all expected status labels');
    } else {
      console.log(`  ⚠️ Waiting page may be missing some status labels (found ${statusLabels.length}, expected at least 3)`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing leave application flow: ${error.message}`);
  }
}

// Test 4: QR Code Generation and Scan Flow
async function testQRCodeFlow(driver) {
  console.log("  Testing QR code generation and scan flow");
  
  // Step 1: Verify QR code generation
  // Grey box knowledge: We know QR page expects an ID parameter
  await driver.get('http://localhost:5173/qr?id=12345');
  
  try {
    // Check if QR code is rendered (as SVG)
    const svgElements = await driver.findElements(By.tagName('svg'));
    
    if (svgElements.length > 0) {
      console.log('  ✓ QR code page renders SVG element for the QR code');
    } else {
      console.log('  ✗ QR code page is not rendering expected SVG element');
    }
    
    // Check if page has proper heading
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
    
    if (await heading.isDisplayed()) {
      console.log('  ✓ QR code page contains expected heading');
    } else {
      console.log('  ✗ QR code page is missing expected heading');
    }
  } catch (error) {
    console.log(`  ✗ Error testing QR code generation: ${error.message}`);
  }
  
  // Step 2: Verify scan page functionality
  // Grey box knowledge: Scan page expects both ID and token parameters
  await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
  
  try {
    // Check if page has student information or authorization message
    // Note: This might fail due to an alert if token is invalid, which is normal
    const pageSource = await driver.getPageSource();
    
    // Grey box knowledge: We know scan page should mention authorization or student details
    if (pageSource.includes('Authorized') || pageSource.includes('Student') || pageSource.includes('Details')) {
      console.log('  ✓ Scan page contains expected authorization content');
    } else {
      // We might get an alert saying token is invalid, which is expected since we're using a fake token
      console.log('  ⚠️ Scan page does not contain expected content (may be due to invalid token)');
    }
  } catch (error) {
    if (error.toString().includes('alert')) {
      console.log('  ⚠️ Scan page showed an alert (expected with invalid token)');
    } else {
      console.log(`  ✗ Error testing scan functionality: ${error.message}`);
    }
  }
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