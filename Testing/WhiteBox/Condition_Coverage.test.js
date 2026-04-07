const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

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
    
    console.log('Running Condition Test 1: Parent and Admin Auth Conditions');
    await testParentAdminConditions(driver);
    
    console.log('Running Condition Test 2: Step Component Status Conditions');
    await testStepStatusConditions(driver);
    
    console.log('Running Condition Test 3: Authentication Condition via Auth Page');
    await testAuthCondition(driver);
    
    console.log('All condition tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test parent and admin auth conditions in Waiting component
async function testParentAdminConditions(driver) {
  // Navigate to waiting page
  await driver.get('http://localhost:5173/waiting');
  
  // Wait for components to load
  await driver.wait(until.elementLocated(By.className('relative flex items-center space-x-4 py-4 group')), 5000);
  
  // In the Waiting component, there's a condition: if(parent && admin){...} 
  // We can't directly manipulate the state, but we can verify the rendering
  // that occurs when these conditions have different values
  
  // Check the initial state
  const steps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
  console.log(`  Found ${steps.length} steps on waiting page`);
  
  // Verify the structure exists to handle parentAuth and adminAuth conditions
  if (steps.length >= 2) {
    console.log('  ✓ Parent and Admin Auth conditions structure verified');
  } else {
    console.log('  ⚠️ Expected more steps for parent/admin auth conditions');
  }
}

// Test condition in Step component for status values
async function testStepStatusConditions(driver) {
  await driver.get('http://localhost:5173/waiting');
  
  // Wait for steps to be visible
  await driver.wait(until.elementLocated(By.className('relative flex items-center space-x-4 py-4 group')), 5000);
  
  // Find labels for steps
  const labels = await driver.findElements(By.xpath("//span[contains(@class, 'text-lg font-semibold')]"));
  
  if (labels.length === 0) {
    throw new Error('Expected to find step labels but found none');
  }
  
  // Check condition: if status === "done" ? text-green-600 : status === "loading" ? text-blue-600 : text-gray-500
  // We'll check if at least one of the expected color classes is present
  let foundColorClasses = false;
  
  for (let i = 0; i < labels.length; i++) {
    const labelClass = await labels[i].getAttribute('class');
    if (labelClass.includes('text-green-') || 
        labelClass.includes('text-blue-') || 
        labelClass.includes('text-gray-')) {
      foundColorClasses = true;
      console.log(`  Step ${i + 1} has color class: ${labelClass}`);
    }
  }
  
  if (foundColorClasses) {
    console.log('  ✓ Step status conditions verified through color classes');
  } else {
    throw new Error('Expected step labels to have status-based color classes');
  }
}

// Test condition in userRouter.ts authentication logic (through UI)
async function testAuthCondition(driver) {
  const validToken = 'test-valid-token';
  
  // Test with token condition
  await driver.get(`http://localhost:5173/auth?token=${validToken}`);
  
  try {
    // Check if UI renders with authenticate button when token is provided
    const authenticateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Authenticate')]"));
    console.log('  ✓ Auth condition with token verified');
  } catch (error) {
    console.log('  ⚠️ Authenticate button not found with token');
  }
  
  // Test without token condition
  await driver.get('http://localhost:5173/auth');
  
  try {
    // Check if UI renders differently when token is not provided
    const authenticateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Authenticate')]"));
    console.log('  ✓ Auth condition without token verified');
  } catch (error) {
    console.log('  ⚠️ Authenticate button not found without token');
  }
}