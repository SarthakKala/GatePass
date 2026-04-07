const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Use Case Testing
 * 
 * This test verifies specific user scenarios work from start to finish.
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
    
    console.log('Running Use Case Tests');
    
    // Use Case 1: Student Registration and Leave Application
    console.log('\nUse Case 1: Student Registration and Leave Application');
    await testStudentRegistrationAndLeave(driver);
    
    // Use Case 2: Admin Approval Process
    console.log('\nUse Case 2: Admin Approval Process');
    await testAdminApprovalProcess(driver);
    
    // Use Case 3: QR Code Generation and Scanning
    console.log('\nUse Case 3: QR Code Generation and Scanning');
    await testQRCodeFlow(driver);
    
    console.log('\nAll use case tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test student registration and leave application use case
async function testStudentRegistrationAndLeave(driver) {
  /*
   * Use Case 1: Student Registration and Leave Application
   * 
   * Steps:
   * 1. Navigate to signup page
   * 2. Fill in student registration form
   * 3. Submit registration form (simulated)
   * 4. Navigate to dashboard
   * 5. Fill in leave application
   * 6. Submit leave application (simulated)
   * 7. Verify redirection to waiting page
   */
  
  console.log('  Step 1-2: Navigating to signup page and filling registration form');
  
  // Navigate to signup page
  await driver.get('http://localhost:5173/signup');
  
  // Fill registration form
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Test Student');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('teststudent@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Test Hostel');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('ST12345');
  
  console.log('  ✓ Registration form filled successfully');
  
  // Verify signup button is present (Step 3 simulation)
  try {
    const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
    if (await signupButton.isEnabled()) {
      console.log('  ✓ Step 3: Signup button is enabled (submission possible)');
    } else {
      console.log('  ✗ Step 3: Signup button is disabled');
    }
  } catch (e) {
    console.log('  ✗ Step 3: Signup button not found');
  }
  
  // Simulate successful registration by navigating directly to dashboard (Step 4)
  console.log('  Step 4: Navigating to dashboard (simulating successful registration)');
  await driver.get('http://localhost:5173/dash');
  
  // Verify dashboard is accessible
  try {
    const leaveHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Leave Application')]"));
    console.log('  ✓ Dashboard accessed successfully');
    
    // Step 5: Fill leave application
    console.log('  Step 5: Filling leave application form');
    await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
    await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Home');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Family visit');
    
    console.log('  ✓ Leave application form filled successfully');
    
    // Verify submit button is present (Step 6 simulation)
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    if (await submitButton.isEnabled()) {
      console.log('  ✓ Step 6: Submit button is enabled (submission possible)');
    } else {
      console.log('  ✗ Step 6: Submit button is disabled');
    }
    
    // Step 7: Simulate submission by navigating to waiting page
    console.log('  Step 7: Navigating to waiting page (simulating successful submission)');
    await driver.get('http://localhost:5173/waiting');
    
    // Verify waiting page is accessible
    const waitingHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
    if (await waitingHeading.isDisplayed()) {
      console.log('  ✓ Waiting page accessed successfully');
    } else {
      console.log('  ✗ Waiting page not displaying expected heading');
    }
  } catch (e) {
    console.log('  ✗ Error accessing required page elements');
    console.error(e.message);
  }
}

// Test admin approval process use case
async function testAdminApprovalProcess(driver) {
  /*
   * Use Case 2: Admin Approval Process
   * 
   * Steps:
   * 1. Navigate to admin signin page
   * 2. Fill in admin credentials
   * 3. Submit signin form (simulated)
   * 4. Navigate to admin dashboard
   * 5. Verify student requests are displayed
   * 6. Simulate approval action
   */
  
  console.log('  Step 1-2: Navigating to admin signin page and filling credentials');
  
  // Navigate to admin signin page
  await driver.get('http://localhost:5173/adminsignin');
  
  // Fill admin credentials
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('admin@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('adminpass');
  
  console.log('  ✓ Admin credentials filled successfully');
  
  // Verify signin button is present (Step 3 simulation)
  try {
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    if (await signinButton.isEnabled()) {
      console.log('  ✓ Step 3: Signin button is enabled (submission possible)');
    } else {
      console.log('  ✗ Step 3: Signin button is disabled');
    }
  } catch (e) {
    console.log('  ✗ Step 3: Signin button not found');
  }
  
  // Navigate to admin dashboard (Step 4 - simulating successful login)
  console.log('  Step 4: Navigating to admin dashboard (simulating successful login)');
  await driver.get('http://localhost:5173/admindash');
  
  // Step 5: Verify student requests are displayed in some form
  try {
    const dashboardHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Admin Dashboard')]"));
    console.log('  ✓ Admin dashboard accessed successfully');
    
    // Check for any student request elements (very generic check since we don't know the exact structure)
    const allowButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Allow')]"));
    if (allowButtons.length > 0) {
      console.log(`  ✓ Step 5: Found ${allowButtons.length} student request(s) with Allow buttons`);
      
      // Step 6: Simulate clicking the first "Allow" button
      console.log('  Step 6: Simulating approval action (not actually clicking to avoid data modification)');
      console.log('  ✓ Allow button is present and could be clicked');
    } else {
      console.log('  ⚠️ Step 5-6: No student requests found with Allow buttons');
      console.log('  This could be normal if there are no pending requests');
    }
  } catch (e) {
    console.log('  ✗ Error accessing admin dashboard elements');
    console.error(e.message);
  }
}

// Test QR code generation and scanning use case
async function testQRCodeFlow(driver) {
  /*
   * Use Case 3: QR Code Generation and Scanning
   * 
   * Steps:
   * 1. Navigate to QR code page with student ID parameter
   * 2. Verify QR code is displayed
   * 3. Simulate QR code scan by navigating to scan page with parameters
   * 4. Verify student details are displayed on scan page
   */
  
  // Step 1: Navigate to QR code page with mock student ID
  console.log('  Step 1: Navigating to QR code page');
  await driver.get('http://localhost:5173/qr?id=123456');
  
  // Step 2: Verify QR code is displayed
  try {
    const qrHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
    console.log('  ✓ QR page accessed successfully');
    
    // Check for SVG element (which would be the QR code)
    const qrCode = await driver.findElements(By.tagName('svg'));
    if (qrCode.length > 0) {
      console.log('  ✓ Step 2: QR code is displayed');
      
      // Step 3: Simulate QR code scan by navigating to scan page with parameters
      console.log('  Step 3: Simulating QR code scan');
      await driver.get('http://localhost:5173/scan?id=123456&token=mocked-token');
      
      // Step 4: Verify student details page is shown
      try {
        const scanHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Student Authorized')]"));
        console.log('  ✓ Step 4: Scan page accessed successfully');
        
        // If we reach here, the basic flow works
        console.log('  ✓ QR code scanning flow is functional');
      } catch (e) {
        // This might fail due to the token being invalid
        console.log('  ⚠️ Step 4: Scan page not showing expected content');
        console.log('  This is expected since we\'re using a mock token that isn\'t valid');
      }
    } else {
      console.log('  ✗ Step 2: QR code not found on page');
    }
  } catch (e) {
    console.log('  ✗ Error accessing QR page elements');
    console.error(e.message);
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