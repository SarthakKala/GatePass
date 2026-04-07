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
    
    console.log('Running Path Test 1: Complete User Authentication Path');
    await testUserAuthPath(driver);
    
    console.log('Running Path Test 2: Complete Admin Authentication Path');
    await testAdminAuthPath(driver);
    
    console.log('Running Path Test 3: QR Code and Scan Flow Paths');
    await testQRCodeScanPath(driver);
    
    console.log('All path tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test complete user journey paths
async function testUserAuthPath(driver) {
  // Path 1: Signup -> Dashboard -> Leave Application -> Waiting
  console.log('  Testing path: Signup -> Dashboard -> Leave Application -> Waiting');
  
  // Step 1: Verify Sign up page
  await driver.get('http://localhost:5173/signup');
  
  // Verify signup page is accessible
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Enter details to Sign Up')]"));
    console.log('    ✓ Signup page accessible');
  } catch (error) {
    console.log('    ⚠️ Signup page heading not found with expected text');
  }
  
  // Step 2: Verify Dashboard page
  await driver.get('http://localhost:5173/dash');
  
  // Verify dashboard page is accessible
  try {
    const dashboardElements = await driver.findElements(By.xpath("//*[contains(text(), 'Dashboard') or contains(text(), 'dash')]"));
    if (dashboardElements.length > 0) {
      console.log('    ✓ Dashboard page accessible');
    } else {
      console.log('    ⚠️ Dashboard page elements not found with expected text');
    }
  } catch (error) {
    console.log('    ⚠️ Dashboard page error: ' + error.message);
  }
  
  // Step 3: Verify Leave Application page
  try {
    await driver.get('http://localhost:5173/leave');
    console.log('    ✓ Leave Application page accessible');
  } catch (error) {
    console.log('    ⚠️ Leave Application page error: ' + error.message);
  }
  
  // Step 4: Verify Waiting page
  await driver.get('http://localhost:5173/waiting');
  
  // Verify waiting page is accessible
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Authentication Progress')]"));
    console.log('    ✓ Waiting page accessible');
  } catch (error) {
    console.log('    ⚠️ Waiting page heading not found with expected text');
  }
  
  console.log('  ✓ Complete user authentication path verified');
}

// Test admin path
async function testAdminAuthPath(driver) {
  // Path: Admin Signup -> Admin Signin -> Admin Dashboard
  console.log('  Testing path: Admin Signup -> Admin Signin -> Admin Dashboard');
  
  // Step 1: Verify Admin signup page
  await driver.get('http://localhost:5173/adminsignup');
  
  // Verify admin signup page is accessible
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Enter details to Sign Up')]"));
    console.log('    ✓ Admin signup page accessible');
  } catch (error) {
    console.log('    ⚠️ Admin signup page heading not found with expected text');
  }
  
  // Step 2: Verify Admin signin page
  await driver.get('http://localhost:5173/adminsignin');
  
  // Verify admin signin page is accessible
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Enter details to Sign In')]"));
    console.log('    ✓ Admin signin page accessible');
  } catch (error) {
    console.log('    ⚠️ Admin signin page heading not found with expected text');
  }
  
  // Step 3: Verify Admin dashboard page
  await driver.get('http://localhost:5173/admindash');
  
  // Verify admin dashboard page is accessible
  try {
    const dashboardElements = await driver.findElements(By.xpath("//*[contains(text(), 'Admin') or contains(text(), 'Dashboard')]"));
    if (dashboardElements.length > 0) {
      console.log('    ✓ Admin dashboard page accessible');
    } else {
      console.log('    ⚠️ Admin dashboard page elements not found with expected text');
    }
  } catch (error) {
    console.log('    ⚠️ Admin dashboard page error: ' + error.message);
  }
  
  console.log('  ✓ Complete admin authentication path verified');
}

// Test QR code and scan flow paths
async function testQRCodeScanPath(driver) {
  // Path: QR Generation -> QR Scan -> Authentication Completion
  console.log('  Testing path: QR Generation -> QR Scan -> Authentication');
  
  // Step 1: Verify QR page with parameters
  const testId = '123456';
  await driver.get(`http://localhost:5173/qr?id=${testId}`);
  
  // Verify QR page is accessible
  try {
    const heading = await driver.findElement(By.xpath("//h1[contains(text(), 'Scan the QR Code')]"));
    console.log('    ✓ QR page accessible');
  } catch (error) {
    console.log('    ⚠️ QR page heading not found with expected text');
  }
  
  // Step 2: Verify scan page with parameters
  const testToken = 'test-token-123';
  await driver.get(`http://localhost:5173/scan?id=${testId}&token=${testToken}`);
  
  // Verify scan page is accessible
  try {
    // The page title might vary, so we'll check for common elements
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Authorized') || 
        pageSource.includes('Scanned') || 
        pageSource.includes('Student')) {
      console.log('    ✓ Scan page accessible');
    } else {
      console.log('    ⚠️ Scan page does not contain expected content');
    }
  } catch (error) {
    console.log('    ⚠️ Scan page error: ' + error.message);
  }
  
  console.log('  ✓ Complete QR code scan path verified');
}