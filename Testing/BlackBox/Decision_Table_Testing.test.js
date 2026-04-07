const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

/**
 * Decision Table Testing
 * 
 * This test examines combinations of inputs to determine appropriate outputs
 * based on a decision table approach.
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
    
    console.log('Running Decision Table Tests');
    
    // Test 1: Leave Application Form Decision Table
    console.log('\nTest 1: Leave Application Form Decision Table');
    await testLeaveApplicationDecisions(driver);
    
    // Test 2: Authentication Status Decision Table
    console.log('\nTest 2: Authentication Status Decision Table');
    await testAuthStatusDecisions(driver);
    
    console.log('\nAll decision table tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test leave application form decision table
async function testLeaveApplicationDecisions(driver) {
  /*
   * Decision Table for Leave Application Form:
   * 
   * Conditions:
   * 1. From Date provided
   * 2. To Date provided
   * 3. Place to Go provided
   * 4. Reason provided
   * 
   * Actions/Expected Outcomes:
   * - Form should be submittable only when all fields are filled
   */
  
  const testCases = [
    {
      case: "All fields filled",
      from: getCurrentDate(),
      to: getFutureDate(3),
      place: "Home",
      reason: "Family visit",
      expectedResult: "Submittable"
    },
    {
      case: "Missing From Date",
      from: "",
      to: getFutureDate(3),
      place: "Home",
      reason: "Family visit",
      expectedResult: "Not Submittable"
    },
    {
      case: "Missing To Date",
      from: getCurrentDate(),
      to: "",
      place: "Home",
      reason: "Family visit",
      expectedResult: "Not Submittable"
    },
    {
      case: "Missing Place",
      from: getCurrentDate(),
      to: getFutureDate(3),
      place: "",
      reason: "Family visit",
      expectedResult: "Not Submittable"
    },
    {
      case: "Missing Reason",
      from: getCurrentDate(),
      to: getFutureDate(3),
      place: "Home",
      reason: "",
      expectedResult: "Not Submittable"
    }
  ];
  
  for (const testCase of testCases) {
    await driver.get('http://localhost:5173/dash');
    
    // Fill the form based on test case
    if (testCase.from) {
      await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(testCase.from);
    }
    
    if (testCase.to) {
      await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(testCase.to);
    }
    
    if (testCase.place) {
      await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys(testCase.place);
    }
    
    if (testCase.reason) {
      await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys(testCase.reason);
    }
    
    // Check the submit button status - HTML5 validation would enforce required fields
    // but our app might not have client-side validation, so we'll just verify that
    // the button is clickable in all cases, and the validation would happen server-side
    
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    const isEnabled = await submitButton.isEnabled();
    
    console.log(`  Case: ${testCase.case}`);
    console.log(`  - From Date: ${testCase.from || 'empty'}`);
    console.log(`  - To Date: ${testCase.to || 'empty'}`);
    console.log(`  - Place: ${testCase.place || 'empty'}`);
    console.log(`  - Reason: ${testCase.reason || 'empty'}`);
    console.log(`  - Submit button is ${isEnabled ? 'enabled' : 'disabled'}`);
    console.log(`  - Expected result: ${testCase.expectedResult}`);
    console.log(`  - Test ${isEnabled === (testCase.expectedResult === "Submittable") ? 'PASSED' : 'FAILED'}`);
    console.log('');
  }
}

// Test authentication status decision table
async function testAuthStatusDecisions(driver) {
  /*
   * Decision Table for Authentication Status:
   * 
   * This test will validate the Waiting page Status indicators based on
   * different combinations of parent and admin authentication states.
   * 
   * Since we can't directly manipulate the authentication state through the UI,
   * we'll just check the rendering of the Step component based on what we can see.
   */
  
  await driver.get('http://localhost:5173/waiting');
  
  console.log('  Checking authentication status steps...');
  
  // Find all steps
  const steps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
  console.log(`  - Found ${steps.length} authentication steps`);
  
  // Check mail sent step (should always be done/loading when page loads)
  try {
    const mailSentStep = await driver.findElement(By.xpath("//div[contains(@class, 'relative flex') and contains(., 'Mail Sent')]"));
    const mailSentIcon = await mailSentStep.findElement(By.css('svg')); // This will find the icon used
    const iconClass = await mailSentIcon.getAttribute('class');
    
    console.log(`  - Mail Sent step status: ${iconClass.includes('green') ? 'Done' : iconClass.includes('blue') ? 'Loading' : 'Pending'}`);
  } catch (error) {
    console.log(`  - Could not determine Mail Sent step status`);
  }
  
  // Check parent authentication step
  try {
    const parentAuthStep = await driver.findElement(By.xpath("//div[contains(@class, 'relative flex') and contains(., 'Parent Authentication')]"));
    const parentAuthIcon = await parentAuthStep.findElement(By.css('svg')); // This will find the icon used
    const iconClass = await parentAuthIcon.getAttribute('class');
    
    console.log(`  - Parent Authentication step status: ${iconClass.includes('green') ? 'Done' : iconClass.includes('blue') ? 'Loading' : 'Pending'}`);
  } catch (error) {
    console.log(`  - Could not determine Parent Authentication step status`);
  }
  
  // Check admin authentication step
  try {
    const adminAuthStep = await driver.findElement(By.xpath("//div[contains(@class, 'relative flex') and contains(., 'Admin Authentication')]"));
    const adminAuthIcon = await adminAuthStep.findElement(By.css('svg')); // This will find the icon used
    const iconClass = await adminAuthIcon.getAttribute('class');
    
    console.log(`  - Admin Authentication step status: ${iconClass.includes('green') ? 'Done' : iconClass.includes('blue') ? 'Loading' : 'Pending'}`);
  } catch (error) {
    console.log(`  - Could not determine Admin Authentication step status`);
  }
  
  console.log('  This is a partial test as we cannot manipulate authentication states directly.');
  console.log('  A full test would verify all combinations of parent and admin authentication.');
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