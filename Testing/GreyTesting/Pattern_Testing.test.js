const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Pattern Testing for Gate Pass Application
 * 
 * This approach verifies specific patterns and workflows in the application.
 * We'll focus on common patterns like form validation, authentication,
 * and component state management.
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
    
    console.log('Running Pattern Testing');
    
    // Test 1: Form Validation Pattern
    console.log('\nTest 1: Form Validation Pattern');
    await testFormValidationPattern(driver);
    
    // Test 2: Authentication Flow Pattern
    console.log('\nTest 2: Authentication Flow Pattern');
    await testAuthenticationPattern(driver);
    
    // Test 3: Component State Management Pattern
    console.log('\nTest 3: Component State Management Pattern');
    await testComponentStatePattern(driver);
    
    // Test 4: Navigation and Routing Pattern
    console.log('\nTest 4: Navigation and Routing Pattern');
    await testNavigationRoutingPattern(driver);
    
    console.log('\nAll pattern tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test 1: Form Validation Pattern
async function testFormValidationPattern(driver) {
  console.log("  Testing form validation patterns");
  
  // Grey box knowledge: We know the forms use HTML5 and custom validation
  
  // Check signup form validation pattern
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Test email validation pattern
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    await emailField.clear();
    await emailField.sendKeys('invalid-email');
    
    // Grey box knowledge: Email fields should typically have type="email" for HTML5 validation
    const emailType = await emailField.getAttribute('type');
    
    if (emailType === 'email') {
      console.log('  ✓ Email field uses appropriate HTML5 validation (type="email")');
    } else {
      console.log(`  ⚠️ Email field does not use HTML5 validation (type="${emailType}")`);
    }
    
    // Test password validation pattern
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    
    // Grey box knowledge: Password fields should have type="password"
    const passwordType = await passwordField.getAttribute('type');
    
    if (passwordType === 'password') {
      console.log('  ✓ Password field uses appropriate HTML5 security (type="password")');
    } else {
      console.log(`  ⚠️ Password field does not use HTML5 security (type="${passwordType}")`);
    }
    
    // Check for required attribute pattern on mandatory fields
    const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
    const nameRequired = await nameField.getAttribute('required');
    
    if (nameRequired === 'true') {
      console.log('  ✓ Name field uses appropriate required attribute for validation');
    } else {
      console.log('  ⚠️ Name field may be missing required attribute for validation');
    }
  } catch (error) {
    console.log(`  ✗ Error testing form validation pattern: ${error.message}`);
  }
  
  // Check leave application form validation pattern
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Test date input pattern
    const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
    const dateType = await fromDateField.getAttribute('type');
    
    // Grey box knowledge: Date fields should have type="date" for proper date validation
    if (dateType === 'date') {
      console.log('  ✓ Date field uses appropriate HTML5 validation (type="date")');
    } else {
      console.log(`  ⚠️ Date field does not use HTML5 validation (type="${dateType}")`);
    }
    
    // Grey box knowledge: We know the application should validate that from date is before to date
    await fromDateField.sendKeys(getFutureDate(5));
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(2));
    
    // Look for validation error messages or indicators
    const errorMessages = await driver.findElements(By.xpath("//*[contains(text(), 'before') or contains(text(), 'invalid date')]"));
    
    // We can't be sure exactly how the validation is implemented, so report what we found
    console.log(`  ℹ️ Found ${errorMessages.length} possible date validation error messages`);
  } catch (error) {
    console.log(`  ✗ Error testing date validation pattern: ${error.message}`);
  }
}

// Test 2: Authentication Flow Pattern
async function testAuthenticationPattern(driver) {
  console.log("  Testing authentication patterns");
  
  // Grey box knowledge: We know authentication involves signup, signin, and redirects
  
  // Step 1: Check if login form follows common authentication patterns
  await driver.get('http://localhost:5173/signin');
  
  try {
    // Check for common authentication pattern elements
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    
    // Check if there's a link to signup page (common pattern)
    const signupLinks = await driver.findElements(By.xpath("//a[contains(text(), 'Sign up') or contains(text(), 'Signup') or contains(text(), 'Register')]"));
    
    if (signupLinks.length > 0) {
      console.log('  ✓ Authentication follows common pattern with link to registration page');
    } else {
      console.log('  ⚠️ Authentication may be missing link to registration page');
    }
    
    // Check for remember me option (common pattern)
    const rememberMe = await driver.findElements(By.xpath("//input[@type='checkbox'] | //label[contains(text(), 'Remember')]"));
    
    if (rememberMe.length > 0) {
      console.log('  ✓ Authentication follows common pattern with remember me option');
    } else {
      console.log('  ⚠️ Authentication may be missing remember me option');
    }
    
    // Grey box knowledge: Authentication forms should prevent autocomplete for security
    const autocomplete = await passwordField.getAttribute('autocomplete');
    
    if (autocomplete === 'off' || autocomplete === 'new-password') {
      console.log('  ✓ Password field follows security pattern with autocomplete disabled');
    } else {
      console.log('  ⚠️ Password field may not follow security best practice for autocomplete');
    }
  } catch (error) {
    console.log(`  ✗ Error testing authentication pattern: ${error.message}`);
  }
  
  // Step 2: Check admin authentication pattern
  await driver.get('http://localhost:5173/adminsignin');
  
  try {
    // Admin authentication should have similar patterns to user authentication
    const adminAuthElements = await driver.findElements(By.xpath("//input[@placeholder='Enter Your Email'] | //input[@placeholder='Enter Your Password']"));
    
    if (adminAuthElements.length >= 2) {
      console.log('  ✓ Admin authentication follows same pattern as user authentication');
    } else {
      console.log('  ⚠️ Admin authentication may not follow same pattern as user authentication');
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin authentication pattern: ${error.message}`);
  }
}

// Test 3: Component State Management Pattern
async function testComponentStatePattern(driver) {
  console.log("  Testing component state management patterns");
  
  // Grey box knowledge: We know the waiting page uses component state to show status
  
  await driver.get('http://localhost:5173/waiting');
  
  try {
    // Check for state indicators in the waiting process
    const steps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
    
    if (steps.length >= 3) {
      console.log(`  ✓ Found ${steps.length} state steps in waiting component`);
      
      // Check if states follow the pattern of "done", "loading", "pending"
      // Grey box knowledge: We know steps use SVG icons with different colors to indicate state
      // Green = done, Blue = loading, Gray = pending
      
      const greenIcons = await driver.findElements(By.css('svg[class*="text-green"]'));
      const blueIcons = await driver.findElements(By.css('svg[class*="text-blue"]'));
      const grayIcons = await driver.findElements(By.css('svg[class*="text-gray"]'));
      
      console.log(`  ℹ️ State distribution: ${greenIcons.length} completed, ${blueIcons.length} in progress, ${grayIcons.length} pending`);
      
      if (greenIcons.length + blueIcons.length + grayIcons.length === steps.length) {
        console.log('  ✓ Component state pattern consistently applied to all steps');
      } else {
        console.log('  ⚠️ Component state pattern may not be consistently applied');
      }
    } else {
      console.log('  ⚠️ Expected more state steps in waiting component');
    }
  } catch (error) {
    console.log(`  ✗ Error testing component state pattern: ${error.message}`);
  }
  
  // Check for stateful behavior in form fields
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Fill a form field and then navigate away and back to see if state persists
    // Grey box knowledge: React forms might maintain state during navigation within the app
    
    const destinationField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
    await destinationField.sendKeys('Test State Persistence');
    
    // Navigate to another page and back
    await driver.get('http://localhost:5173/waiting');
    await driver.get('http://localhost:5173/dash');
    
    // Check if the form value persisted (it usually won't without state management)
    const destinationFieldAfter = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
    const fieldValue = await destinationFieldAfter.getAttribute('value');
    
    if (fieldValue === 'Test State Persistence') {
      console.log('  ✓ Form maintains state during navigation (likely using state management)');
    } else {
      console.log('  ℹ️ Form does not maintain state during navigation (normal behavior without state management)');
    }
  } catch (error) {
    console.log(`  ✗ Error testing form state persistence: ${error.message}`);
  }
}

// Test 4: Navigation and Routing Pattern
async function testNavigationRoutingPattern(driver) {
  console.log("  Testing navigation and routing patterns");
  
  // Grey box knowledge: We know the application uses client-side routing
  
  // Step 1: Test direct URL access pattern
  const routes = [
    '/signup',
    '/signin',
    '/dash',
    '/waiting',
    '/adminsignup',
    '/adminsignin',
    '/admindash',
    '/qr',
    '/scan'
  ];
  
  for (const route of routes) {
    try {
      await driver.get(`http://localhost:5173${route}`);
      
      // Check if page loaded without redirecting
      const currentUrl = await driver.getCurrentUrl();
      
      if (currentUrl.includes(route)) {
        console.log(`  ✓ Direct access to ${route} works correctly`);
      } else {
        console.log(`  ⚠️ Direct access to ${route} redirected to ${currentUrl}`);
      }
    } catch (error) {
      console.log(`  ✗ Error accessing ${route}: ${error.message}`);
    }
  }
  
  // Step 2: Test navigation via links pattern
  await driver.get('http://localhost:5173/signin');
  
  try {
    // Look for navigation links
    const navLinks = await driver.findElements(By.tagName('a'));
    
    if (navLinks.length > 0) {
      console.log(`  ✓ Found ${navLinks.length} navigation links`);
      
      // Test the first link to see if client-side routing is working
      await navLinks[0].click();
      
      // Wait a moment for navigation
      await driver.sleep(500);
      
      const newUrl = await driver.getCurrentUrl();
      console.log(`  ℹ️ Navigation link led to: ${newUrl}`);
    } else {
      console.log('  ⚠️ No navigation links found on signin page');
    }
  } catch (error) {
    console.log(`  ✗ Error testing navigation links: ${error.message}`);
  }
  
  // Step 3: Test protected route pattern
  // Grey box knowledge: Dashboard should be a protected route requiring authentication
  
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Check if we're still on dashboard or redirected to login
    const currentUrl = await driver.getCurrentUrl();
    
    if (currentUrl.includes('signin')) {
      console.log('  ✓ Protected route pattern correctly redirects unauthenticated users to signin');
    } else if (currentUrl.includes('dash')) {
      // We might still be on dashboard if the application doesn't enforce authentication in development
      console.log('  ⚠️ Protected route accessible without authentication (may be intentional in development)');
    } else {
      console.log(`  ⚠️ Unexpected redirect to ${currentUrl}`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing protected route pattern: ${error.message}`);
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