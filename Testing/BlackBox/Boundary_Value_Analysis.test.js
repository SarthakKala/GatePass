const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Boundary Value Analysis Tests
 * 
 * This test focuses on the boundaries between partitions,
 * including at the edges of boundaries.
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
    
    console.log('Running Boundary Value Analysis Tests');
    
    // Test 1: Password Length Boundaries
    console.log('\nTest 1: Password Length Boundaries');
    await testPasswordBoundaries(driver);
    
    // Test 2: Date Boundaries
    console.log('\nTest 2: Date Boundaries');
    await testDateBoundaries(driver);
    
    // Test 3: Text Field Length Boundaries
    console.log('\nTest 3: Text Field Length Boundaries');
    await testTextFieldBoundaries(driver);
    
    console.log('\nAll boundary value analysis tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test password length boundaries
async function testPasswordBoundaries(driver) {
  // Password boundary values
  const passwordTests = [
    { value: '', description: 'Empty password (below min)' },
    { value: '12345', description: 'Below minimum length (5 chars)' },
    { value: '123456', description: 'Minimum length (6 chars)' },
    { value: '1234567', description: 'Just above minimum (7 chars)' },
    { value: 'a'.repeat(100), description: 'Very long password (100 chars)' }
  ];
  
  for (const test of passwordTests) {
    await driver.get('http://localhost:5173/signup');
    
    // Enter password
    const passwordInput = await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"));
    await passwordInput.clear();
    await passwordInput.sendKeys(test.value);
    
    // Verify input is accepted by field
    const actualValue = await passwordInput.getAttribute('value');
    if (actualValue === test.value) {
      console.log(`  ✓ Password accepted: ${test.description}`);
    } else {
      console.log(`  ✗ Password rejected: ${test.description}`);
    }
  }
}

// Test date field boundaries
async function testDateBoundaries(driver) {
  await driver.get('http://localhost:5173/dash');
  
  // Date boundary values
  const dateTests = [
    { value: getPastDate(365), description: 'Far past date (1 year ago)' },
    { value: getPastDate(1), description: 'Yesterday' },
    { value: getCurrentDate(), description: 'Today' },
    { value: getFutureDate(1), description: 'Tomorrow' },
    { value: getFutureDate(365), description: 'Far future date (1 year ahead)' }
  ];
  
  for (const test of dateTests) {
    // Enter from date
    const fromDateInput = await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"));
    await fromDateInput.clear();
    await fromDateInput.sendKeys(test.value);
    
    // Verify input is accepted
    const actualValue = await fromDateInput.getAttribute('value');
    if (actualValue) {
      console.log(`  ✓ Date accepted: ${test.description} - ${test.value}`);
    } else {
      console.log(`  ✗ Date rejected: ${test.description} - ${test.value}`);
    }
  }
}

// Test text field length boundaries
async function testTextFieldBoundaries(driver) {
  await driver.get('http://localhost:5173/signup');
  
  // Text field boundary values
  const textTests = [
    { field: "//input[@placeholder='Enter Your Name']", value: '', description: 'Empty name' },
    { field: "//input[@placeholder='Enter Your Name']", value: 'A', description: 'Single character name' },
    { field: "//input[@placeholder='Enter Your Name']", value: 'A'.repeat(50), description: 'Very long name (50 chars)' },
    { field: "//input[@placeholder='Enter Hostel Name']", value: '', description: 'Empty hostel name' },
    { field: "//input[@placeholder='Enter Hostel Name']", value: 'X', description: 'Single character hostel name' },
    { field: "//input[@placeholder='Enter Hostel Name']", value: 'X'.repeat(50), description: 'Very long hostel name (50 chars)' }
  ];
  
  for (const test of textTests) {
    // Find and clear field
    const input = await driver.findElement(By.xpath(test.field));
    await input.clear();
    
    // Enter test value
    await input.sendKeys(test.value);
    
    // Verify input is accepted
    const actualValue = await input.getAttribute('value');
    if (actualValue === test.value) {
      console.log(`  ✓ Text field accepted: ${test.description}`);
    } else {
      console.log(`  ✗ Text field rejected: ${test.description}`);
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

// Helper function to get past date in YYYY-MM-DD format
function getPastDate(days) {
  const past = new Date();
  past.setDate(past.getDate() - days);
  const year = past.getFullYear();
  const month = String(past.getMonth() + 1).padStart(2, '0');
  const day = String(past.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}