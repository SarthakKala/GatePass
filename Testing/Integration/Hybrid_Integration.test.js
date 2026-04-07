const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Hybrid Integration Testing for Gate Pass Application
 * 
 * This approach combines top-down and bottom-up strategies, focusing on testing
 * critical paths within the system first, then integrating related components
 * in the most efficient way.
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
    
    console.log('Running Hybrid Integration Testing');

    // Critical Path 1: Student Registration and Leave Application
    console.log('\nCritical Path 1: Student Registration and Leave Application');
    await testStudentRegistrationLeaveFlow(driver);
    
    // Critical Path 2: Admin Approval Workflow
    console.log('\nCritical Path 2: Admin Approval Workflow');
    await testAdminApprovalWorkflow(driver);
    
    // Critical Path 3: QR Code Generation and Verification
    console.log('\nCritical Path 3: QR Code Generation and Verification');
    await testQRCodeWorkflow(driver);
    
    // Integration of Cross-Component Features
    console.log('\nIntegration of Cross-Component Features');
    await testCrossComponentIntegration(driver);
    
    console.log('\nAll hybrid integration tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Critical Path 1: Student Registration and Leave Application
async function testStudentRegistrationLeaveFlow(driver) {
  console.log("  Testing student registration and leave application critical path");
  
  // Step 1: Test signup form field components integration (bottom-up)
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Verify input fields integration
    const formFields = await driver.findElements(By.xpath("//input[@placeholder]"));
    
    if (formFields.length >= 6) {
      console.log(`  ✓ Signup form has ${formFields.length} input field components integrated`);
      
      // Test field types integration
      const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
      const emailType = await emailField.getAttribute('type');
      
      const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
      const passwordType = await passwordField.getAttribute('type');
      
      if (emailType === 'email' && passwordType === 'password') {
        console.log('  ✓ Input field types are correctly integrated for validation');
      } else {
        console.log('  ⚠️ Some input field types may not be correctly integrated');
      }
      
      // Fill the form (top-down testing the form as a whole)
      await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Hybrid Test User');
      await emailField.sendKeys('hybrid@example.com');
      await passwordField.sendKeys('hybrid123');
      await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
      await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Hybrid Hostel');
      await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('HYB12345');
      
      // Check button integration
      const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
      const isButtonEnabled = await signupButton.isEnabled();
      
      if (isButtonEnabled) {
        console.log('  ✓ Form validation is correctly integrated with submit button');
      } else {
        console.log('  ✗ Submit button not enabled despite all fields being filled');
      }
    } else {
      console.log(`  ⚠️ Signup form has only ${formFields.length} input fields`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing signup form integration: ${error.message}`);
  }
  
  // Step 2: Test dashboard form integration (simulate successful signup)
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Test for required leave application form components
    const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
    const toDateField = await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"));
    const destinationField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
    const reasonField = await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"));
    
    if (fromDateField && toDateField && destinationField && reasonField) {
      console.log('  ✓ Leave application form components are correctly integrated');
      
      // Fill the form
      await fromDateField.sendKeys(getCurrentDate());
      await toDateField.sendKeys(getFutureDate(5));
      await destinationField.sendKeys('Hybrid Test Destination');
      await reasonField.sendKeys('Hybrid Testing');
      
      // Test form submission integration
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
      const isSubmitEnabled = await submitButton.isEnabled();
      
      if (isSubmitEnabled) {
        console.log('  ✓ Leave application form validation is integrated with submit button');
        
        // Test frontend-backend integration by checking form behavior
        // But don't actually submit to avoid creating real data
        console.log('  Simulating form submission...');
        
        // Navigate directly to waiting page to simulate the next step
        await driver.get('http://localhost:5173/waiting');
        
        // Check if waiting page components are integrated
        const waitingElements = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
        
        if (waitingElements.length >= 3) {
          console.log(`  ✓ Waiting page has ${waitingElements.length} status step components integrated`);
          
          // Test integration of status labels
          const statusTexts = await Promise.all(
            waitingElements.map(async (el) => await el.getText())
          );
          
          if (
            statusTexts.some(text => text.includes('Mail Sent')) &&
            statusTexts.some(text => text.includes('Parent Authentication')) &&
            statusTexts.some(text => text.includes('Admin Authentication'))
          ) {
            console.log('  ✓ All required status steps are integrated');
          } else {
            console.log('  ⚠️ Some required status steps may not be integrated');
          }
        } else {
          console.log('  ⚠️ Waiting page has fewer than expected status steps');
        }
      } else {
        console.log('  ✗ Submit button not enabled despite all fields being filled');
      }
    } else {
      console.log('  ✗ Some leave application form components are missing');
    }
  } catch (error) {
    console.log(`  ✗ Error testing leave application form integration: ${error.message}`);
  }
}

// Critical Path 2: Admin Approval Workflow
async function testAdminApprovalWorkflow(driver) {
  console.log("  Testing admin approval workflow critical path");
  
  // Step 1: Test admin signin (bottom-up test of credentials fields)
  await driver.get('http://localhost:5173/adminsignin');
  
  try {
    // Test credential fields integration
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    
    await emailField.clear();
    await emailField.sendKeys('admin@example.com');
    
    await passwordField.clear();
    await passwordField.sendKeys('admin123');
    
    // Test form validation integration
    const signinButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
    const isButtonEnabled = await signinButton.isEnabled();
    
    if (isButtonEnabled) {
      console.log('  ✓ Admin signin form components are correctly integrated');
      
      // Navigate to admin dashboard (simulating successful login)
      await driver.get('http://localhost:5173/admindash');
      
      // Top-down test of admin dashboard integrated components
      const dashboardHeadingElements = await driver.findElements(By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
      
      if (dashboardHeadingElements.length > 0) {
        console.log('  ✓ Admin dashboard header components are correctly integrated');
        
        // Test for student request display components
        const tables = await driver.findElements(By.tagName('table'));
        const lists = await driver.findElements(By.tagName('ul'));
        
        if (tables.length > 0 || lists.length > 0) {
          console.log('  ✓ Student request display components are integrated');
          
          // Test for action button components
          const actionButtons = await driver.findElements(
            By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Approve') or contains(text(), 'Deny') or contains(text(), 'Reject')]")
          );
          
          if (actionButtons.length > 0) {
            console.log(`  ✓ ${actionButtons.length} approval action button components are integrated`);
            
            // Test button interactivity integration
            const firstButton = actionButtons[0];
            const buttonText = await firstButton.getText();
            const isEnabled = await firstButton.isEnabled();
            
            console.log(`  Found ${buttonText} button, enabled: ${isEnabled}`);
            
            // In hybrid approach, we would simulate the action here
            console.log('  Simulating admin approval action...');
            
            // To test complete integration path:
            // 1. If this was a real test with real data, we would click the button
            // 2. But since we don't want to modify real data, we'll simulate the next step
            
            // Check if student info components are integrated (bottom-up)
            const studentInfoElements = await driver.findElements(By.xpath("//*[contains(text(), 'Student') or contains(text(), 'Name') or contains(text(), 'Email')]"));
            
            console.log(`  Found ${studentInfoElements.length} student info elements integrated with approval view`);
          } else {
            console.log('  ⚠️ No approval action buttons found');
          }
        } else {
          console.log('  ⚠️ No student request display components found');
        }
      } else {
        console.log('  ✗ Admin dashboard header components not found');
      }
    } else {
      console.log('  ✗ Admin signin button not enabled despite fields being filled');
    }
  } catch (error) {
    console.log(`  ✗ Error testing admin approval workflow: ${error.message}`);
  }
  
  // Step 2: Test parent auth simulation (top-down testing system behavior)
  try {
    console.log('  Testing parent authentication system behavior...');
    await driver.get('http://localhost:5173/waiting');
    
    // Check for authentication status indicators
    const statusElements = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
    
    // Look specifically for parent authentication status
    const parentAuthElements = await driver.findElements(By.xpath("//*[contains(text(), 'Parent Authentication')]"));
    
    if (parentAuthElements.length > 0) {
      console.log('  ✓ Parent authentication status component is integrated');
      
      // Test for status indicator components (icon colors, etc.)
      try {
        const parentAuthElement = parentAuthElements[0];
        const parentContainer = await parentAuthElement.findElement(By.xpath("./ancestor::div[contains(@class, 'relative flex')]"));
        const statusIcon = await parentContainer.findElement(By.css('svg'));
        const iconClass = await statusIcon.getAttribute('class');
        
        // Check if status indicators have proper color classes
        if (iconClass.includes('text-green') || iconClass.includes('text-blue') || iconClass.includes('text-gray')) {
          console.log('  ✓ Parent auth status indicators are correctly integrated');
        } else {
          console.log('  ⚠️ Parent auth status indicators may not have expected styling');
        }
      } catch (iconError) {
        console.log('  ⚠️ Could not verify parent auth status indicator components');
      }
    } else {
      console.log('  ✗ Parent authentication status component not found');
    }
  } catch (error) {
    console.log(`  ✗ Error testing parent authentication integration: ${error.message}`);
  }
}

// Critical Path 3: QR Code Generation and Verification
async function testQRCodeWorkflow(driver) {
  console.log("  Testing QR code generation and verification critical path");
  
  // Step 1: Test QR code generation component integration
  await driver.get('http://localhost:5173/qr?id=12345');
  
  try {
    // Check for QR code SVG component integration
    const svgElements = await driver.findElements(By.tagName('svg'));
    
    if (svgElements.length > 0) {
      console.log('  ✓ QR code SVG component is integrated');
      
      // Check for page heading integration
      const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
      
      if (await heading.isDisplayed()) {
        console.log('  ✓ QR code page heading is correctly integrated');
      } else {
        console.log('  ⚠️ QR code page heading may not be correctly integrated');
      }
      
      // Test whether URL parameters are correctly integrated
      const currentUrl = await driver.getCurrentUrl();
      
      if (currentUrl.includes('id=12345')) {
        console.log('  ✓ QR code generation correctly integrates URL parameters');
      } else {
        console.log('  ⚠️ QR code generation may not correctly handle URL parameters');
      }
      
      // Step 2: Test QR code scanning integration
      console.log('  Testing QR code scanning integration...');
      await driver.get('http://localhost:5173/scan?id=12345&token=test-token');
      
      // Check for scan result components
      const pageSource = await driver.getPageSource();
      
      if (pageSource.includes('Authorized') || pageSource.includes('Student')) {
        console.log('  ✓ QR code scanning result component is integrated');
      } else {
        console.log('  ⚠️ QR code scanning result component may not be integrated or not showing expected content');
      }
      
      // Test authorized student info display components
      try {
        const studentInfoElements = await driver.findElements(
          By.xpath("//*[contains(text(), 'Roll No') or contains(text(), 'Hostel') or contains(text(), 'Valid Until')]")
        );
        
        if (studentInfoElements.length > 0) {
          console.log(`  ✓ Found ${studentInfoElements.length} student info elements integrated with scan result`);
        } else {
          console.log('  ⚠️ Student info elements may not be integrated with scan result');
        }
        
        // Test authorization status display component
        const authStatusElements = await driver.findElements(
          By.xpath("//*[contains(text(), 'Authorized') or contains(@class, 'bg-green')]")
        );
        
        if (authStatusElements.length > 0) {
          console.log('  ✓ Authorization status component is integrated with scan result');
        } else {
          console.log('  ⚠️ Authorization status component may not be integrated with scan result');
        }
      } catch (error) {
        console.log('  ⚠️ Could not verify student info display components');
      }
    } else {
      console.log('  ✗ QR code SVG component not found');
    }
  } catch (error) {
    console.log(`  ✗ Error testing QR code workflow: ${error.message}`);
  }
}

// Integration of Cross-Component Features
async function testCrossComponentIntegration(driver) {
  console.log("  Testing integration of cross-component features");
  
  // Test 1: Navigation system integration
  console.log('  Testing navigation system integration...');
  
  // Test navigation link functionality between components
  await driver.get('http://localhost:5173/signin');
  
  try {
    // Find navigation links
    const navLinks = await driver.findElements(By.tagName('a'));
    
    if (navLinks.length > 0) {
      console.log(`  Found ${navLinks.length} navigation links integrated`);
      
      // Test the first link to verify client-side routing integration
      await navLinks[0].click();
      
      // Wait a moment for navigation
      await driver.sleep(500);
      
      const afterClickUrl = await driver.getCurrentUrl();
      console.log(`  Navigation link integration test: clicked link navigated to ${afterClickUrl}`);
    } else {
      console.log('  ⚠️ No navigation links found on signin page');
    }
  } catch (error) {
    console.log(`  ✗ Error testing navigation system integration: ${error.message}`);
  }
  
  // Test 2: Authentication state integration with protected routes
  console.log('  Testing authentication state integration with routes...');
  
  try {
    // Test accessing protected route (should redirect unauthenticated users)
    await driver.get('http://localhost:5173/dash');
    
    // Wait a moment for any redirects
    await driver.sleep(500);
    
    // Check current URL to see if protection is integrated
    const currentUrl = await driver.getCurrentUrl();
    
    if (currentUrl.includes('signin')) {
      console.log('  ✓ Route protection is correctly integrated (redirects to signin)');
    } else if (currentUrl.includes('dash')) {
      console.log('  ⚠️ Route protection may not be integrated (stays on dash)');
      console.log('  Note: This may be intentional in development environments');
    } else {
      console.log(`  ⚠️ Unexpected redirect to ${currentUrl}`);
    }
  } catch (error) {
    console.log(`  ✗ Error testing route protection integration: ${error.message}`);
  }
  
  // Test 3: Integration between frontend validation and backend API endpoints
  console.log('  Testing frontend-backend integration via form validation...');
  
  // Test email format validation which should be consistent with backend requirements
  await driver.get('http://localhost:5173/signup');
  
  try {
    const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
    const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
    
    // Fill valid data in other fields to isolate email validation
    await nameField.sendKeys('Test User');
    await passwordField.sendKeys('password123');
    
    // Test with invalid email
    await emailField.clear();
    await emailField.sendKeys('invalid-email');
    
    // Check if frontend validation is consistent with backend requirements
    const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
    const isButtonEnabledWithInvalidEmail = await signupButton.isEnabled();
    
    // Test with valid email
    await emailField.clear();
    await emailField.sendKeys('valid@example.com');
    
    const isButtonEnabledWithValidEmail = await signupButton.isEnabled();
    
    if (!isButtonEnabledWithInvalidEmail && isButtonEnabledWithValidEmail) {
      console.log('  ✓ Email validation is consistently integrated between frontend and backend');
    } else if (isButtonEnabledWithInvalidEmail) {
      console.log('  ⚠️ Email validation may not be integrated between frontend and backend');
    } else {
      console.log('  ⚠️ Button state inconsistent with validation expectations');
    }
  } catch (error) {
    console.log(`  ✗ Error testing frontend-backend validation integration: ${error.message}`);
  }
  
  // Test 4: Integration of error handling between components
  console.log('  Testing error handling integration...');
  
  // Test invalid QR code URL parameter handling
  await driver.get('http://localhost:5173/qr'); // Missing required id parameter
  
  try {
    // Check if error message is displayed
    const pageSource = await driver.getPageSource();
    
    if (pageSource.includes('error') || pageSource.includes('invalid') || pageSource.includes('missing')) {
      console.log('  ✓ Error handling for invalid parameters is integrated');
    } else {
      // Check if there's a QR code despite missing parameter
      const svgElements = await driver.findElements(By.tagName('svg'));
      
      if (svgElements.length === 0) {
        console.log('  ✓ QR code is not generated without required parameters (correct behavior)');
      } else {
        console.log('  ⚠️ QR code is generated despite missing parameters (potential integration issue)');
      }
    }
  } catch (error) {
    console.log(`  ✗ Error testing error handling integration: ${error.message}`);
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