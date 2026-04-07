const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Bottom-Up Integration Testing for Gate Pass Application
 * 
 * This approach starts testing from lower-level components and gradually integrates
 * higher-level components, using drivers to simulate higher-level components that
 * aren't yet integrated.
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
    
    console.log('Running Bottom-Up Integration Testing');

    // Level 1: Form Components Integration
    console.log('\nLevel 1: Form Components Integration');
    await testFormComponentsIntegration(driver);
    
    // Level 2: Authentication Components Integration
    console.log('\nLevel 2: Authentication Components Integration');
    await testAuthComponentsIntegration(driver);
    
    // Level 3: Leave Application Process Integration
    console.log('\nLevel 3: Leave Application Process Integration');
    await testLeaveApplicationProcessIntegration(driver);
    
    // Level 4: Admin Workflow Integration
    console.log('\nLevel 4: Admin Workflow Integration');
    await testAdminWorkflowIntegration(driver);
    
    console.log('\nAll bottom-up integration tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Level 1: Form Components Integration
async function testFormComponentsIntegration(driver) {
  console.log("  Testing form components integration");
  
  // Test 1: Input field validation integration
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Test email input field validation
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    await emailField.clear();
    
    // Test integration with HTML5 validation
    const emailType = await emailField.getAttribute('type');
    if (emailType === 'email') {
      console.log('  ✓ Email field integrated with HTML5 validation (type="email")');
    } else {
      console.log(`  ⚠️ Email field not integrated with HTML5 validation (type="${emailType}")`);
    }
    
    // Test integration of required field validation
    const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
    const isNameRequired = await nameField.getAttribute('required');
    
    if (isNameRequired === 'true') {
      console.log('  ✓ Name field integrated with required attribute validation');
    } else {
      console.log('  ⚠️ Name field not integrated with required attribute validation');
    }
    
    // Test password field type integration
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    const passwordType = await passwordField.getAttribute('type');
    
    if (passwordType === 'password') {
      console.log('  ✓ Password field integrated with secure input type');
    } else {
      console.log(`  ⚠️ Password field not using secure input type (type="${passwordType}")`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing form field validations: ${error.message}`);
  }
  
  // Test 2: Date input field integration
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Check if date fields are properly integrated with HTML5 date input
    const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
    const dateType = await fromDateField.getAttribute('type');
    
    if (dateType === 'date') {
      console.log('  ✓ Date field integrated with HTML5 date input');
    } else {
      console.log(`  ⚠️ Date field not integrated with HTML5 date input (type="${dateType}")`);
    }
    
    // Test date field interaction integration
    await fromDateField.sendKeys(getCurrentDate());
    const dateValue = await fromDateField.getAttribute('value');
    
    if (dateValue) {
      console.log('  ✓ Date field properly handles input interaction');
    } else {
      console.log('  ✗ Date field failed to handle input interaction');
    }
  } catch (error) {
    console.log(`  ✗ Error testing date input field: ${error.message}`);
  }
  
  // Test 3: Buttons enabled/disabled states integration
  try {
    // Clear all fields first
    const formFields = await driver.findElements(By.xpath("//input[@placeholder]"));
    for (const field of formFields) {
      await field.clear();
    }
    
    // Check if submit button is disabled when form is empty
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isDisabledWhenEmpty = !(await submitButton.isEnabled());
    
    // Fill all fields
    await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
    await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Test Destination');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Test Reason');
    
    // Check if button is enabled when form is filled
    const isEnabledWhenFilled = await submitButton.isEnabled();
    
    if (isDisabledWhenEmpty && isEnabledWhenFilled) {
      console.log('  ✓ Submit button enabled/disabled state correctly integrated with form validation');
    } else if (!isDisabledWhenEmpty) {
      console.log('  ⚠️ Submit button enabled even with empty form');
    } else if (!isEnabledWhenFilled) {
      console.log('  ✗ Submit button not enabled despite filled form');
    }
  } catch (error) {
    console.log(`  ✗ Error testing button state integration: ${error.message}`);
  }
}

// Level 2: Authentication Components Integration
async function testAuthComponentsIntegration(driver) {
  console.log("  Testing authentication components integration");
  
  // Test 1: Student credential verification integration
  await driver.get('http://localhost:5173/signin');
  
  try {
    // Fill in credentials
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('test@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
    
    // Check if login button is enabled, indicating integration with form validation
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isButtonEnabled = await signinButton.isEnabled();
    
    if (isButtonEnabled) {
      console.log('  ✓ Signin button correctly integrated with form validation');
    } else {
      console.log('  ✗ Signin button not enabled despite filled form');
    }
    
    // Level 2 can't actually submit the form without integrating to higher levels
    // So we use a driver component to simulate successful authentication
    // by directly navigating to the dashboard
    console.log('  Using driver component to simulate authentication...');
    await driver.get('http://localhost:5173/dash');
    
    // Check if we successfully navigated to the dashboard
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/dash')) {
      console.log('  ✓ Successfully navigated to dashboard using driver component');
    } else {
      console.log(`  ✗ Navigation to dashboard failed, current URL: ${currentUrl}`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing student credential verification: ${error.message}`);
  }
  
  // Test 2: Admin credential verification integration
  await driver.get('http://localhost:5173/adminsignin');
  
  try {
    // Fill in admin credentials
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('admin@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('admin123');
    
    // Check if login button is enabled
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isButtonEnabled = await signinButton.isEnabled();
    
    if (isButtonEnabled) {
      console.log('  ✓ Admin signin button correctly integrated with form validation');
    } else {
      console.log('  ✗ Admin signin button not enabled despite filled form');
    }
    
    // Use driver component to simulate admin authentication
    console.log('  Using driver component to simulate admin authentication...');
    await driver.get('http://localhost:5173/admindash');
    
    // Check if we successfully navigated to the admin dashboard
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/admindash')) {
      console.log('  ✓ Successfully navigated to admin dashboard using driver component');
    } else {
      console.log(`  ✗ Navigation to admin dashboard failed, current URL: ${currentUrl}`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin credential verification: ${error.message}`);
  }
  
  // Test 3: Registration form integration
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Fill all registration fields
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Bottom Up User');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('bottomup@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('bottomup123');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Test Hostel');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('BU12345');
    
    // Check if submit button is enabled
    const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
    const isButtonEnabled = await signupButton.isEnabled();
    
    if (isButtonEnabled) {
      console.log('  ✓ Registration form components are correctly integrated');
    } else {
      console.log('  ✗ Registration button not enabled despite filled form');
    }
  } catch (error) {
    console.log(`  ✗ Error testing registration form: ${error.message}`);
  }
}

// Level 3: Leave Application Process Integration
async function testLeaveApplicationProcessIntegration(driver) {
  console.log("  Testing leave application process integration");
  
  // Test 1: Leave application form submission integration
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Fill leave application form
    await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
    await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
    await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Bottom Up Test Destination');
    await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Bottom Up Testing');
    
    // Check submit button integration
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isButtonEnabled = await submitButton.isEnabled();
    
    if (isButtonEnabled) {
      console.log('  ✓ Leave application form is correctly integrated with submit button');
      
      // Can't actually submit without integrating to server
      // So use a driver component to simulate successful submission
      console.log('  Using driver component to simulate form submission...');
      await driver.get('http://localhost:5173/waiting');
      
      // Check waiting page integration
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('/waiting')) {
        console.log('  ✓ Successfully navigated to waiting page using driver component');
        
        // Check integration of status components on waiting page
        const statusSteps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
        
        if (statusSteps.length >= 2) {
          console.log(`  ✓ Waiting page has ${statusSteps.length} status step components integrated`);
          
          // Check for auth status step labels
          const statusTexts = await Promise.all(
            statusSteps.map(async (step) => await step.getText())
          );
          
          const hasExpectedSteps = statusTexts.some(text => 
            text.includes('Mail Sent') || 
            text.includes('Parent Authentication') || 
            text.includes('Admin Authentication')
          );
          
          if (hasExpectedSteps) {
            console.log('  ✓ Authentication status components are correctly integrated');
          } else {
            console.log('  ⚠️ Authentication status components may not be correctly labeled');
          }
        } else {
          console.log('  ⚠️ Few status step components found on waiting page');
        }
      } else {
        console.log(`  ✗ Navigation to waiting page failed, current URL: ${currentUrl}`);
      }
    } else {
      console.log('  ✗ Submit button not enabled despite filled form');
    }
  } catch (error) {
    console.log(`  ✗ Error testing leave application integration: ${error.message}`);
  }
  
  // Test 2: QR Code generation integration
  try {
    // Use driver component to simulate successful approval process
    console.log('  Using driver component to simulate approval process...');
    await driver.get('http://localhost:5173/qr?id=12345');
    
    // Check if QR code components are integrated
    const svgElements = await driver.findElements(By.tagName('svg'));
    
    if (svgElements.length > 0) {
      console.log('  ✓ QR code component is correctly integrated');
      
      // Check for download or share buttons that might be integrated
      const buttons = await driver.findElements(By.tagName('button'));
      console.log(`  Found ${buttons.length} button components integrated with QR code page`);
    } else {
      console.log('  ✗ QR code component not found on page');
    }
  } catch (error) {
    console.log(`  ✗ Error testing QR code integration: ${error.message}`);
  }
  
  // Test 3: QR Code scanning integration
  try {
    // Use driver component to simulate scanning process
    console.log('  Using driver component to simulate QR code scanning...');
    await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
    
    // Check if scan result components are integrated
    const pageSource = await driver.getPageSource();
    
    if (pageSource.includes('Authorized') || pageSource.includes('Student')) {
      console.log('  ✓ QR code scanning result component is correctly integrated');
    } else {
      console.log('  ⚠️ QR code scanning result component not found or not showing expected content');
    }
  } catch (error) {
    console.log(`  ✗ Error testing QR code scanning integration: ${error.message}`);
  }
}

// Level 4: Admin Workflow Integration
async function testAdminWorkflowIntegration(driver) {
  console.log("  Testing admin workflow integration");
  
  // Test 1: Admin dashboard components integration
  await driver.get('http://localhost:5173/admindash');
  
  try {
    // Check if admin dashboard components are integrated
    const headingElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
    
    if (headingElements.length > 0) {
      console.log('  ✓ Admin dashboard header components are correctly integrated');
      
      // Check for request handling components
      const tableElements = await driver.findElements(By.tagName('table'));
      const listElements = await driver.findElements(By.tagName('ul'));
      
      if (tableElements.length > 0) {
        console.log('  ✓ Admin dashboard has integrated table component for requests');
      } else if (listElements.length > 0) {
        console.log('  ✓ Admin dashboard has integrated list component for requests');
      } else {
        console.log('  ⚠️ No table or list components found on admin dashboard');
      }
      
      // Check for action button components
      const actionButtons = await driver.findElements(
        By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Approve') or contains(text(), 'Deny') or contains(text(), 'Reject')]")
      );
      
      if (actionButtons.length > 0) {
        console.log(`  ✓ Admin dashboard has ${actionButtons.length} action button components integrated`);
      } else {
        console.log('  ⚠️ No action buttons found on admin dashboard');
      }
    } else {
      console.log('  ✗ Admin dashboard header components not found');
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin dashboard integration: ${error.message}`);
  }
  
  // Test 2: Full workflow integration
  try {
    // Test navigation back to student flows
    console.log('  Testing full workflow integration from admin back to student views...');
    await driver.get('http://localhost:5173/dash');
    
    // Check if student dashboard loaded
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Leave Application') || pageSource.includes('From Date')) {
      console.log('  ✓ Successfully integrated navigation between admin and student views');
    } else {
      console.log('  ⚠️ Integration between admin and student views may be incomplete');
    }
    
    // Test integration of waiting status and full application flow
    await driver.get('http://localhost:5173/waiting');
    
    // Check for steps that indicate backend status integration
    const mailSentStep = await driver.findElements(By.xpath("//*[contains(text(), 'Mail Sent')]"));
    const parentAuthStep = await driver.findElements(By.xpath("//*[contains(text(), 'Parent Authentication')]"));
    const adminAuthStep = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Authentication')]"));
    
    if (mailSentStep.length > 0 && parentAuthStep.length > 0 && adminAuthStep.length > 0) {
      console.log('  ✓ All authentication step components are correctly integrated on waiting page');
    } else {
      console.log('  ⚠️ Some authentication step components may be missing on waiting page');
    }
    
    // Test final QR integration
    await driver.get('http://localhost:5173/qr?id=12345');
    
    // Check QR code and scanning integration
    const qrSvg = await driver.findElements(By.tagName('svg'));
    
    if (qrSvg.length > 0) {
      console.log('  ✓ QR code and scanning components integration completed');
    } else {
      console.log('  ✗ QR code component integration incomplete');
    }
  } catch (error) {
    console.log(`  ✗ Error testing full workflow integration: ${error.message}`);
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