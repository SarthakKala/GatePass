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
    
    console.log('Running Test Case 1: User signup process');
    await testUserSignup(driver);
    
    console.log('Running Test Case 2: User authentication process');
    await testUserAuthentication(driver);
    
    console.log('Running Test Case 3: Waiting page statements');
    await testWaitingPage(driver);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test Case 1: User Signup Flow
async function testUserSignup(driver) {
  // Navigate to signup page
  await driver.get('http://localhost:5173/signup');
  
  // Fill in form fields (exercising all input statements)
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Test User');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('test@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('parent@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Test Hostel');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('R12345');
  
  // Verify button exists
  const button = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
  const buttonText = await button.getText();
  
  // Manual assertion
  if (buttonText === 'Signup') {
    console.log('  ✓ Signup button text verified');
  } else {
    throw new Error(`Expected button text to be 'Signup', but got '${buttonText}'`);
  }
}

// Test Case 2: User Authentication Flow
async function testUserAuthentication(driver) {
  // Navigate to sign in page
  await driver.get('http://localhost:5173/signin');
  
  // Fill in credentials
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('test@example.com');
  await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('password123');
  
  // Verify sign in button
  const buttonText = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]")).getText();
  
  // Manual assertion
  if (buttonText === 'Signin') {
    console.log('  ✓ Signin button text verified');
  } else {
    throw new Error(`Expected button text to be 'Signin', but got '${buttonText}'`);
  }
}

// Test Case 3: Waiting Page Statements
async function testWaitingPage(driver) {
  // Navigate to waiting page
  await driver.get('http://localhost:5173/waiting');
  
  // Verify the page structure
  const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]")).getText();
  
  // Manual assertion for heading
  if (heading === 'Authentication Progress') {
    console.log('  ✓ Waiting page heading verified');
  } else {
    throw new Error(`Expected heading to be 'Authentication Progress', but got '${heading}'`);
  }
  
  // Check if steps are rendered
  const steps = await driver.findElements(By.className('relative flex items-center space-x-4 py-4 group'));
  
  // Manual assertion for steps
  if (steps.length > 0) {
    console.log(`  ✓ Found ${steps.length} steps on waiting page`);
  } else {
    throw new Error('Expected to find steps on waiting page, but found none');
  }
}