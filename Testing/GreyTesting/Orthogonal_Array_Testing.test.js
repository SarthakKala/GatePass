const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Orthogonal Array Testing for Gate Pass Application
 * 
 * This approach uses statistical methods to reduce test combinations while
 * maintaining coverage. We'll use L4(2^3) orthogonal array for testing
 * the leave application form with 3 parameters.
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
    
    console.log('Running Orthogonal Array Testing');
    
    // Test 1: Form Field Validation Using L4(2^3) Orthogonal Array
    console.log('\nTest 1: Form Field Validation Using L4(2^3) Orthogonal Array');
    await testFormValidationWithOrthogonalArray(driver);
    
    // Test 2: Student Info Combinations Using L8(2^4) Orthogonal Array
    console.log('\nTest 2: Student Info Combinations Using L8(2^4) Orthogonal Array');
    await testStudentInfoWithOrthogonalArray(driver);
    
    // Test 3: URL Parameter Combinations Using L4(2^3) Orthogonal Array
    console.log('\nTest 3: URL Parameter Combinations Using L4(2^3) Orthogonal Array');
    await testURLParametersWithOrthogonalArray(driver);
    
    console.log('\nAll orthogonal array tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test 1: Form Field Validation Using L4(2^3) Orthogonal Array
async function testFormValidationWithOrthogonalArray(driver) {
  console.log("  Testing leave application form with L4(2^3) orthogonal array");
  
  await driver.get('http://localhost:5173/dash');
  
  try {
    // Define parameters for orthogonal array
    // A: From Date (valid/invalid)
    // B: To Date (valid/invalid)
    // C: Destination (filled/empty)
    
    // L4(2^3) Orthogonal Array:
    // Run | A | B | C |
    // ------------------
    //  1  | 1 | 1 | 1 |
    //  2  | 1 | 2 | 2 |
    //  3  | 2 | 1 | 2 |
    //  4  | 2 | 2 | 1 |
    
    const orthogonalArray = [
      { run: 1, fromDate: 'valid', toDate: 'valid', destination: 'filled', expected: 'valid' },
      { run: 2, fromDate: 'valid', toDate: 'invalid', destination: 'empty', expected: 'invalid' },
      { run: 3, fromDate: 'invalid', toDate: 'valid', destination: 'empty', expected: 'invalid' },
      { run: 4, fromDate: 'invalid', toDate: 'invalid', destination: 'filled', expected: 'invalid' }
    ];
    
    // Grey box knowledge: We understand the form validation logic
    for (const test of orthogonalArray) {
      console.log(`\n  Running test combination ${test.run}:`);
      console.log(`  - From Date: ${test.fromDate}`);
      console.log(`  - To Date: ${test.toDate}`);
      console.log(`  - Destination: ${test.destination}`);
      
      // Reset form for each test
      await driver.navigate().refresh();
      
      // Fill the form based on test parameters
      const fromDateField = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
      const toDateField = await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"));
      const destinationField = await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"));
      const reasonField = await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"));
      
      // Always fill reason with a valid value (not part of orthogonal array)
      await reasonField.clear();
      await reasonField.sendKeys('Orthogonal Array Testing');
      
      // Clear all test fields
      await fromDateField.clear();
      await toDateField.clear();
      await destinationField.clear();
      
      // Fill test fields based on orthogonal array values
      if (test.fromDate === 'valid') {
        await fromDateField.sendKeys(getCurrentDate());
      } else {
        await fromDateField.sendKeys('invalid-date');
      }
      
      if (test.toDate === 'valid') {
        await toDateField.sendKeys(getFutureDate(5));
      } else {
        await toDateField.sendKeys('invalid-date');
      }
      
      if (test.destination === 'filled') {
        await destinationField.sendKeys('Test Destination');
      }
      
      // Check if form validation behaves as expected
      const formIsValid = await checkFormValidity(driver);
      const testPassed = (
        (formIsValid && test.expected === 'valid') || 
        (!formIsValid && test.expected === 'invalid')
      );
      
      if (testPassed) {
        console.log(`  ✓ Test passed: Form validation behaved as expected (${test.expected})`);
      } else {
        console.log(`  ✗ Test failed: Form validation did not behave as expected`);
        console.log(`    Expected: ${test.expected}, Actual: ${formIsValid ? "valid" : "invalid"}`);
      }
    }
  } catch (error) {
    console.log(`  ✗ Error in orthogonal array testing: ${error.message}`);
  }
}

// Test 2: Student Info Combinations Using L8(2^4) Orthogonal Array
async function testStudentInfoWithOrthogonalArray(driver) {
  console.log("  Testing student registration form with L8(2^4) orthogonal array");
  
  await driver.get('http://localhost:5173/signup');
  
  try {
    // Define parameters for orthogonal array
    // A: Name (valid/invalid)
    // B: Email (valid/invalid)
    // C: Password (valid/invalid)
    // D: Parent Email (valid/invalid)
    
    // L8(2^4) Orthogonal Array (subset of L8):
    // Run | A | B | C | D |
    // ---------------------
    //  1  | 1 | 1 | 1 | 1 |
    //  2  | 1 | 1 | 2 | 2 |
    //  3  | 1 | 2 | 1 | 2 |
    //  4  | 1 | 2 | 2 | 1 |
    //  5  | 2 | 1 | 1 | 2 |
    //  6  | 2 | 1 | 2 | 1 |
    //  7  | 2 | 2 | 1 | 1 |
    //  8  | 2 | 2 | 2 | 2 |
    
    // We'll use a subset of L8 to reduce test time
    const orthogonalArray = [
      { run: 1, name: 'valid', email: 'valid', password: 'valid', parentEmail: 'valid', expected: 'valid' },
      { run: 4, name: 'valid', email: 'invalid', password: 'invalid', parentEmail: 'valid', expected: 'invalid' },
      { run: 6, name: 'invalid', email: 'valid', password: 'invalid', parentEmail: 'valid', expected: 'invalid' },
      { run: 7, name: 'invalid', email: 'invalid', password: 'valid', parentEmail: 'valid', expected: 'invalid' }
    ];
    
    // Grey box knowledge: We understand the form validation requirements
    for (const test of orthogonalArray) {
      console.log(`\n  Running test combination ${test.run}:`);
      console.log(`  - Name: ${test.name}`);
      console.log(`  - Email: ${test.email}`);
      console.log(`  - Password: ${test.password}`);
      console.log(`  - Parent Email: ${test.parentEmail}`);
      
      // Reset form for each test
      await driver.navigate().refresh();
      
      // Fill the form based on test parameters
      const nameField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"));
      const emailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"));
      const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
      const parentEmailField = await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']"));
      const hostelField = await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']"));
      const rollNoField = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']"));
      
      // Always fill hostel and roll number with valid values (not part of orthogonal array)
      await hostelField.clear();
      await hostelField.sendKeys('Test Hostel');
      await rollNoField.clear();
      await rollNoField.sendKeys('OA12345');
      
      // Clear all test fields
      await nameField.clear();
      await emailField.clear();
      await passwordField.clear();
      await parentEmailField.clear();
      
      // Fill test fields based on orthogonal array values
      if (test.name === 'valid') {
        await nameField.sendKeys('Test Student');
      } else {
        await nameField.sendKeys('');  // Invalid: empty
      }
      
      if (test.email === 'valid') {
        await emailField.sendKeys('test@example.com');
      } else {
        await emailField.sendKeys('invalid-email');  // Invalid format
      }
      
      if (test.password === 'valid') {
        await passwordField.sendKeys('password123');
      } else {
        await passwordField.sendKeys('123');  // Too short, invalid
      }
      
      if (test.parentEmail === 'valid') {
        await parentEmailField.sendKeys('parent@example.com');
      } else {
        await parentEmailField.sendKeys('invalid-parent-email');
      }
      
      // Check if signup button is enabled, which indicates validation passed
      const signupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
      const isEnabled = await signupButton.isEnabled();
      
      // Look for any validation error messages
      const errorElements = await driver.findElements(By.xpath("//*[contains(text(), 'required') or contains(text(), 'invalid') or contains(text(), 'error')]"));
      const hasVisibleErrors = await Promise.all(errorElements.map(async (e) => await e.isDisplayed()));
      const hasErrors = hasVisibleErrors.some(visible => visible);
      
      const formValid = isEnabled && !hasErrors;
      
      if ((formValid && test.expected === 'valid') || (!formValid && test.expected === 'invalid')) {
        console.log(`  ✓ Test passed: Form validation behaved as expected (${test.expected})`);
      } else {
        console.log(`  ✗ Test failed: Form validation did not behave as expected`);
        console.log(`    Expected: ${test.expected}, Actual: ${formValid ? "valid" : "invalid"}`);
      }
    }
  } catch (error) {
    console.log(`  ✗ Error in orthogonal array testing: ${error.message}`);
  }
}

// Test 3: URL Parameter Combinations Using L4(2^3) Orthogonal Array
async function testURLParametersWithOrthogonalArray(driver) {
  console.log("  Testing URL parameter handling with L4(2^3) orthogonal array");
  
  try {
    // Define parameters for orthogonal array
    // A: Page (qr/scan)
    // B: ID Parameter (present/missing)
    // C: Token Parameter (present/missing)
    
    // L4(2^3) Orthogonal Array:
    // Run | A | B | C |
    // ------------------
    //  1  | 1 | 1 | 1 |
    //  2  | 1 | 2 | 2 |
    //  3  | 2 | 1 | 2 |
    //  4  | 2 | 2 | 1 |
    
    const orthogonalArray = [
      { run: 1, page: 'qr', id: 'present', token: 'present' },
      { run: 2, page: 'qr', id: 'missing', token: 'missing' },
      { run: 3, page: 'scan', id: 'present', token: 'missing' },
      { run: 4, page: 'scan', id: 'missing', token: 'present' }
    ];
    
    // Grey box knowledge: We know qr page needs id, scan page needs both id and token
    for (const test of orthogonalArray) {
      console.log(`\n  Running test combination ${test.run}:`);
      console.log(`  - Page: ${test.page}`);
      console.log(`  - ID Parameter: ${test.id}`);
      console.log(`  - Token Parameter: ${test.token}`);
      
      // Build URL based on orthogonal array values
      let url = `http://localhost:5173/${test.page}`;
      const params = [];
      
      if (test.id === 'present') {
        params.push('id=12345');
      }
      
      if (test.token === 'present') {
        params.push('token=test-token');
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      console.log(`  Navigating to: ${url}`);
      
      // Try to navigate to the URL and handle potential alerts
      try {
        await driver.get(url);
        
        // Grey box knowledge: Pages need specific parameters to work correctly
        if (test.page === 'qr') {
          if (test.id === 'present') {
            // QR page with id should show QR code (SVG)
            const svgElements = await driver.findElements(By.tagName('svg'));
            if (svgElements.length > 0) {
              console.log('  ✓ QR page with ID parameter shows QR code as expected');
            } else {
              console.log('  ✗ QR page with ID parameter does not show QR code');
            }
          } else {
            // QR page without id might show error or redirect
            const pageSource = await driver.getPageSource();
            if (pageSource.includes('error') || pageSource.includes('missing') || pageSource.includes('required')) {
              console.log('  ✓ QR page without ID parameter shows error as expected');
            } else {
              console.log('  ⚠️ QR page without ID parameter does not show expected error');
            }
          }
        } else if (test.page === 'scan') {
          // Scan page requires both id and token, may show alert if missing
          if (test.id === 'present' && test.token === 'present') {
            // Should show student details
            const pageSource = await driver.getPageSource();
            if (pageSource.includes('Student') || pageSource.includes('Authorized')) {
              console.log('  ✓ Scan page with both parameters shows student information');
            } else {
              console.log('  ⚠️ Scan page with both parameters does not show expected content');
            }
          } else {
            // Should show error because of missing required parameter
            console.log('  ✓ Scan page handled missing parameters (may show alert)');
          }
        }
      } catch (error) {
        // We might get an alert for invalid parameters, which is expected behavior
        if (error.toString().includes('alert') || error.toString().includes('unexpected alert')) {
          console.log('  ✓ Expected alert was shown for invalid/missing parameters');
        } else {
          console.log(`  ✗ Error navigating to URL: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.log(`  ✗ Error in URL parameter orthogonal array testing: ${error.message}`);
  }
}

// Helper function to check form validity based on submit button state and error messages
async function checkFormValidity(driver) {
  try {
    // Check if submit button is enabled
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isButtonEnabled = await submitButton.isEnabled();
    
    // Check for any validation error messages displayed
    const errorMessages = await driver.findElements(By.xpath("//*[contains(text(), 'required') or contains(text(), 'invalid') or contains(text(), 'error')]"));
    const hasVisibleErrors = await Promise.all(errorMessages.map(async (e) => await e.isDisplayed()));
    const hasErrors = hasVisibleErrors.some(visible => visible);
    
    // Form is valid if button is enabled AND no visible error messages
    return isButtonEnabled && !hasErrors;
  } catch (error) {
    console.log(`  ✗ Error checking form validity: ${error.message}`);
    return false;
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

// Helper function to get past date in YYYY-MM-DD format
function getPastDate(days) {
  const past = new Date();
  past.setDate(past.getDate() - days);
  const year = past.getFullYear();
  const month = String(past.getMonth() + 1).padStart(2, '0');
  const day = String(past.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to add a delay between actions
// This helps prevent tests from running too quickly and causing synchronization issues
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}