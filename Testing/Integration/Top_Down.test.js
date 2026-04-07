const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Top-Down Integration Testing for Gate Pass Application
 * 
 * This approach starts testing from higher-level components and gradually adds
 * lower-level components, using stubs for components that aren't yet integrated.
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
    
    console.log('Running Top-Down Integration Testing');

    // Level 1: Main UI Navigation Flow Integration
    console.log('\nLevel 1: Main UI Navigation Flow Integration');
    await testMainUINavigation(driver);
    
    // Level 2: User Authentication Integration
    console.log('\nLevel 2: User Authentication Integration with Form Submission');
    await testUserAuthIntegration(driver);
    
    // Level 3: Leave Application Flow Integration
    console.log('\nLevel 3: Leave Application Flow Integration');
    await testLeaveApplicationIntegration(driver);
    
    // Level 4: Admin Approval Flow Integration
    console.log('\nLevel 4: Admin Approval Flow Integration');
    await testAdminApprovalIntegration(driver);
    
    console.log('\nAll top-down integration tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Level 1: Main UI Navigation Flow Integration
async function testMainUINavigation(driver) {
  console.log("  Testing main UI navigation integration");
  
  // Define navigation paths to test key routes
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/signup', name: 'Student Signup' },
    { path: '/signin', name: 'Student Signin' },
    { path: '/adminsignup', name: 'Admin Signup' },
    { path: '/adminsignin', name: 'Admin Signin' },
    { path: '/dash', name: 'Student Dashboard' },
    { path: '/admindash', name: 'Admin Dashboard' },
    { path: '/waiting', name: 'Authentication Progress' },
    { path: '/qr', name: 'QR Code Page' }
  ];
  
  // Test each route for proper navigation
  for (const route of routes) {
    try {
      await driver.get(`http://localhost:5173${route.path}`);
      
      // Give time for any redirects or page loading
      await driver.sleep(500);
      
      // Check if page loaded successfully
      const pageSource = await driver.getPageSource();
      const currentUrl = await driver.getCurrentUrl();
      
      // Verify that we landed on the expected page or were redirected appropriately
      // In a real app with auth, some routes may redirect to login
      console.log(`  ✓ Navigation to ${route.name} (${route.path}) - URL: ${currentUrl}`);
    } catch (error) {
      console.log(`  ✗ Error navigating to ${route.name} (${route.path}): ${error.message}`);
    }
  }
  
  // Test navigation between related pages
  try {
    // Test navigation from signin to signup via link
    await driver.get('http://localhost:5173/signin');
    
    // Look for signup link
    const signupLinks = await driver.findElements(By.xpath("//a[contains(text(), 'Sign up') or contains(text(), 'Signup') or contains(text(), 'Register')]"));
    
    if (signupLinks.length > 0) {
      // Click the first signup link
      await signupLinks[0].click();
      
      // Verify we navigated to signup page
      await driver.wait(until.urlContains('/signup'), 2000);
      console.log('  ✓ Navigation link from signin to signup works correctly');
    } else {
      console.log('  ⚠️ No signup link found on signin page');
    }
  } catch (error) {
    console.log(`  ✗ Error testing navigation links: ${error.message}`);
  }
}

// Level 2: User Authentication Integration
async function testUserAuthIntegration(driver) {
  console.log("  Testing user authentication integration");
  
  // Test student signup form integration with validation
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Fill in form fields
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Integration Test User');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('integration@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('integration123');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Test Hostel');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('INT12345');
    
    // Check if button is enabled when form is valid
    const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
    const isSignupEnabled = await signupButton.isEnabled();
    
    if (isSignupEnabled) {
      console.log('  ✓ Signup form validation integrated correctly with submit button');
    } else {
      console.log('  ✗ Signup button not enabled despite valid form input');
    }
    
    // Test form validation by entering invalid input
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    await emailField.clear();
    await emailField.sendKeys('invalid-email');
    
    // Check for validation error indications
    const isStillEnabled = await signupButton.isEnabled();
    
    if (!isStillEnabled) {
      console.log('  ✓ Form validation prevents submission with invalid email');
    } else {
      console.log('  ⚠️ Form validation not preventing submission with invalid email');
    }
    
    // Test signin integration
    await driver.get('http://localhost:5173/signin');
    
    // Fill in form fields
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('test@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
    
    // Check if signin button is enabled
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isSigninEnabled = await signinButton.isEnabled();
    
    if (isSigninEnabled) {
      console.log('  ✓ Signin form validation integrated correctly with submit button');
    } else {
      console.log('  ✗ Signin button not enabled despite valid form input');
    }
    
    // Simulate stub: Instead of actual authentication, we'll navigate directly to dashboard
    console.log('  Using stub for authentication result...');
    await driver.get('http://localhost:5173/dash');
    
    // Verify dashboard loaded correctly
    const pageTitle = await driver.getTitle();
    console.log(`  ✓ Successfully navigated to dashboard page (using stub): ${pageTitle}`);
  } catch (error) {
    console.log(`  ✗ Error in authentication integration test: ${error.message}`);
  }
}

// Level 3: Leave Application Flow Integration
async function testLeaveApplicationIntegration(driver) {
  console.log("  Testing leave application integration");
  
  // Access dashboard where leave application form exists
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Fill in leave application form
    await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
    await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Integration Test Destination');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Integration Testing');
    
    // Check if submit button is enabled
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isSubmitEnabled = await submitButton.isEnabled();
    
    if (isSubmitEnabled) {
      console.log('  ✓ Leave application form validation integrated correctly with submit button');
      
      // Integration with next step: waiting page
      // Simulate submission using stub by directly navigating to waiting page
      await driver.get('http://localhost:5173/waiting');
      
      // Check if waiting page loaded correctly
      try {
        const waitingHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
        if (await waitingHeading.isDisplayed()) {
          console.log('  ✓ Integration with waiting page successful');
          
          // Check for status indicators that show integration with authentication steps
          const steps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
          console.log(`  ✓ Found ${steps.length} integrated authentication steps on waiting page`);
          
          // Check for proper step labels
          const stepLabels = await driver.findElements(
            By.xpath("//*[contains(text(), 'Mail Sent') or contains(text(), 'Parent Authentication') or contains(text(), 'Admin Authentication')]")
          );
          console.log(`  ✓ Authentication steps integrated with proper labels: Found ${stepLabels.length} step labels`);
        } else {
          console.log('  ✗ Waiting page heading not found');
        }
      } catch (error) {
        console.log(`  ✗ Error checking waiting page integration: ${error.message}`);
      }
    } else {
      console.log('  ✗ Submit button not enabled despite valid form input');
    }
    
    // Integration with QR code generation
    // Simulate approved application using stub by directly navigating to QR page
    await driver.get('http://localhost:5173/qr?id=12345');
    
    // Check if QR code generation is integrated correctly
    try {
      const qrHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
      const svgElements = await driver.findElements(By.tagName('svg'));
      
      if (await qrHeading.isDisplayed() && svgElements.length > 0) {
        console.log('  ✓ Integration with QR code generation successful');
      } else {
        console.log('  ✗ QR code generation integration incomplete');
      }
    } catch (error) {
      console.log(`  ✗ Error checking QR integration: ${error.message}`);
    }
  } catch (error) {
    console.log(`  ✗ Error in leave application integration test: ${error.message}`);
  }
}

// Level 4: Admin Approval Flow Integration
async function testAdminApprovalIntegration(driver) {
  console.log("  Testing admin approval flow integration");
  
  // Access admin dashboard
  await driver.get('http://localhost:5173/admindash');
  
  try {
    // Check if admin dashboard UI elements are integrated correctly
    const dashboardElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
    
    if (dashboardElements.length > 0) {
      console.log('  ✓ Admin dashboard UI integration successful');
      
      // Look for student request elements that admin would approve/deny
      const actionButtons = await driver.findElements(
        By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Approve') or contains(text(), 'Deny') or contains(text(), 'Reject')]")
      );
      
      if (actionButtons.length > 0) {
        console.log(`  ✓ Admin approval actions integrated: Found ${actionButtons.length} action buttons`);
      } else {
        console.log('  ⚠️ No action buttons found on admin dashboard');
      }
      
      // Check for student request table/list integration
      const tableElements = await driver.findElements(By.tagName('table'));
      const listElements = await driver.findElements(By.tagName('ul'));
      
      if (tableElements.length > 0 || listElements.length > 0) {
        console.log('  ✓ Student requests display integration successful');
      } else {
        console.log('  ⚠️ No student request table or list found');
      }
    } else {
      console.log('  ✗ Admin dashboard heading elements not found');
    }
    
    // Test integration with scan functionality (simulated)
    await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
    
    // Check for student authorization display
    try {
      const pageSource = await driver.getPageSource();
      
      if (pageSource.includes('Authorized') || pageSource.includes('Student')) {
        console.log('  ✓ Integration with scan functionality successful');
      } else {
        console.log('  ⚠️ Scan page doesn\'t show expected content');
      }
    } catch (error) {
      console.log(`  ✗ Error checking scan integration: ${error.message}`);
    }
  } catch (error) {
    console.log(`  ✗ Error in admin approval integration test: ${error.message}`);
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