const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

/**
 * Performance System Testing for Gate Pass Application
 * 
 * This measures the performance characteristics of the system under various conditions.
 * Note: For comprehensive performance testing, specialized tools like JMeter or k6 would be more suitable.
 * This is a simplified approach using Selenium for basic performance metrics.
 */

// Self-executing async function to run the tests
(async function runTests() {
  let driver;
  const performanceResults = {
    pageLoadTimes: {},
    formSubmissionResponsiveness: {},
    navigationDelays: {},
    timestamp: new Date().toISOString()
  };
  
  try {
    // Set up Chrome options with performance logging
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment for headless testing
    options.setLoggingPrefs({ performance: 'ALL' });
    
    // Initialize the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('Running Performance System Tests');
    
    // Test 1: Page Load Performance
    console.log('\nTest 1: Page Load Performance');
    await testPageLoadPerformance(driver, performanceResults);
    
    // Test 2: Form Submission Responsiveness
    console.log('\nTest 2: Form Submission Responsiveness');
    await testFormSubmissionResponsiveness(driver, performanceResults);
    
    // Test 3: Navigation Performance
    console.log('\nTest 3: Navigation Performance');
    await testNavigationPerformance(driver, performanceResults);
    
    // Generate performance report
    await generatePerformanceReport(performanceResults);
    
    console.log('\nPerformance System Testing Completed!');
    
  } catch (error) {
    console.error('Test runner failed:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})();

// Test 1: Page Load Performance
async function testPageLoadPerformance(driver, results) {
  const pagesToTest = [
    { name: 'Landing Page', url: 'http://localhost:5173/' },
    { name: 'Student Signup', url: 'http://localhost:5173/signup' },
    { name: 'Student Signin', url: 'http://localhost:5173/signin' },
    { name: 'Admin Signin', url: 'http://localhost:5173/adminsignin' },
    { name: 'Dashboard', url: 'http://localhost:5173/dash' },
    { name: 'Waiting Status', url: 'http://localhost:5173/waiting' },
    { name: 'QR Code Page', url: 'http://localhost:5173/qr?id=12345' },
    { name: 'Scan Page', url: 'http://localhost:5173/scan?id=12345&token=test' }
  ];
  
  console.log('Measuring page load times...');
  
  for (const page of pagesToTest) {
    console.log(`  Loading ${page.name}...`);
    
    // Clear performance logs before each page load
    await driver.manage().logs().get('performance');
    
    const start = Date.now();
    await driver.get(page.url);
    
    try {
      // Wait for page to be considered loaded
      await driver.wait(async () => {
        return await driver.executeScript('return document.readyState') === 'complete';
      }, 10000);
      
      const domContentLoaded = Date.now() - start;
      
      // Additional wait to ensure dynamic content is loaded
      await driver.sleep(500);
      
      // Calculate visual completeness (when page appears fully loaded)
      const visuallyComplete = Date.now() - start;
      
      // Get Performance metrics from browser
      const navigationMetrics = await getPerformanceMetrics(driver);
      
      results.pageLoadTimes[page.name] = {
        url: page.url,
        domContentLoaded: `${domContentLoaded}ms`,
        visuallyComplete: `${visuallyComplete}ms`,
        networkMetrics: navigationMetrics
      };
      
      console.log(`  ✅ ${page.name} loaded in ${domContentLoaded}ms (DOM), ${visuallyComplete}ms (visually complete)`);
    } catch (error) {
      console.log(`  ❌ Error testing ${page.name}: ${error.message}`);
      results.pageLoadTimes[page.name] = {
        url: page.url,
        error: error.message
      };
    }
  }
}

// Test 2: Form Submission Responsiveness
async function testFormSubmissionResponsiveness(driver, results) {
  const formsToTest = [
    { 
      name: 'Student Registration Form', 
      url: 'http://localhost:5173/signup',
      fillAction: async (driver) => {
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']")).sendKeys('Performance Test');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('perf_test@example.com');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('perf_test123');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']")).sendKeys('perf_parent@example.com');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']")).sendKeys('Perf Test Hostel');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']")).sendKeys('PERF12345');
      },
      submitAction: async (driver) => {
        const button = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
        // Measure button click responsiveness but don't actually click to prevent form submission
        await button.getRect(); // Forces a paint cycle
      }
    },
    { 
      name: 'Student Login Form', 
      url: 'http://localhost:5173/signin',
      fillAction: async (driver) => {
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']")).sendKeys('perf_test@example.com');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']")).sendKeys('perf_test123');
      },
      submitAction: async (driver) => {
        const button = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
        await button.getRect();
      }
    },
    { 
      name: 'Leave Application Form', 
      url: 'http://localhost:5173/dash',
      fillAction: async (driver) => {
        await driver.findElement(By.xpath("//input[@placeholder='Select From Date']")).sendKeys(getCurrentDate());
        await driver.findElement(By.xpath("//input[@placeholder='Select To Date']")).sendKeys(getFutureDate(3));
        await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']")).sendKeys('Performance Test');
        await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']")).sendKeys('Performance Testing');
      },
      submitAction: async (driver) => {
        const button = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
        await button.getRect();
      }
    }
  ];
  
  console.log('Measuring form submission responsiveness...');
  
  for (const form of formsToTest) {
    console.log(`  Testing ${form.name}...`);
    
    try {
      // Navigate to the form page
      await driver.get(form.url);
      
      // Measure form interaction times
      const fillStart = Date.now();
      await form.fillAction(driver);
      const fillTime = Date.now() - fillStart;
      
      // Measure validation response time
      const validationStart = Date.now();
      await driver.executeScript('document.activeElement.blur()'); // Trigger validation
      await driver.sleep(100); // Wait for validation to complete
      const validationTime = Date.now() - validationStart;
      
      // Measure submit button response time
      const submitStart = Date.now();
      await form.submitAction(driver);
      const submitTime = Date.now() - submitStart;
      
      results.formSubmissionResponsiveness[form.name] = {
        fillTime: `${fillTime}ms`,
        validationTime: `${validationTime}ms`,
        submitButtonResponseTime: `${submitTime}ms`
      };
      
      console.log(`  ✅ ${form.name}: Fill time: ${fillTime}ms, Validation time: ${validationTime}ms, Submit response: ${submitTime}ms`);
    } catch (error) {
      console.log(`  ❌ Error testing ${form.name}: ${error.message}`);
      results.formSubmissionResponsiveness[form.name] = {
        error: error.message
      };
    }
  }
}

// Test 3: Navigation Performance
async function testNavigationPerformance(driver, results) {
  const navigationPaths = [
    { 
      name: 'Signin to Dashboard', 
      from: 'http://localhost:5173/signin', 
      to: 'http://localhost:5173/dash',
      action: async (driver) => {
        // We're just simulating navigation, not actually submitting the form
        await driver.get('http://localhost:5173/dash');
      }
    },
    { 
      name: 'Dashboard to Waiting', 
      from: 'http://localhost:5173/dash', 
      to: 'http://localhost:5173/waiting',
      action: async (driver) => {
        // Simulating submission and redirect
        await driver.get('http://localhost:5173/waiting');
      }
    },
    { 
      name: 'Waiting to QR Code', 
      from: 'http://localhost:5173/waiting', 
      to: 'http://localhost:5173/qr?id=12345',
      action: async (driver) => {
        await driver.get('http://localhost:5173/qr?id=12345');
      }
    }
  ];
  
  console.log('Measuring navigation performance...');
  
  for (const path of navigationPaths) {
    console.log(`  Testing navigation: ${path.name}...`);
    
    try {
      // Navigate to starting page
      await driver.get(path.from);
      
      // Clear performance logs before navigation
      await driver.manage().logs().get('performance');
      
      // Perform navigation action and measure time
      const navigationStart = Date.now();
      await path.action(driver);
      
      // Wait for navigation to complete
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes(new URL(path.to).pathname);
      }, 10000);
      
      // Wait for page to finish loading
      await driver.wait(async () => {
        return await driver.executeScript('return document.readyState') === 'complete';
      }, 10000);
      
      const navigationTime = Date.now() - navigationStart;
      
      // Get additional performance metrics
      const navigationMetrics = await getPerformanceMetrics(driver);
      
      results.navigationDelays[path.name] = {
        from: path.from,
        to: path.to,
        navigationTime: `${navigationTime}ms`,
        performanceMetrics: navigationMetrics
      };
      
      console.log(`  ✅ ${path.name} completed in ${navigationTime}ms`);
    } catch (error) {
      console.log(`  ❌ Error testing ${path.name}: ${error.message}`);
      results.navigationDelays[path.name] = {
        from: path.from,
        to: path.to,
        error: error.message
      };
    }
  }
}

// Helper function to extract performance metrics from browser logs
async function getPerformanceMetrics(driver) {
  try {
    const logs = await driver.manage().logs().get('performance');
    const navigationEvents = logs
      .filter(entry => {
        const message = JSON.parse(entry.message).message;
        return message.method === 'Network.responseReceived' || 
               message.method === 'Page.loadEventFired';
      })
      .map(entry => JSON.parse(entry.message).message);
    
    return {
      networkEvents: navigationEvents.length,
      loadEventTimestamp: navigationEvents.find(e => e.method === 'Page.loadEventFired')?.params?.timestamp
    };
  } catch (error) {
    console.log(`  ⚠️ Could not extract performance metrics: ${error.message}`);
    return {};
  }
}

// Generate HTML report for performance test results
async function generatePerformanceReport(results) {
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'performance_testing_report.html');
  const jsonReportPath = path.join(reportDir, 'performance_data.json');
  
  // Save raw JSON data for further analysis
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  
  const timestamp = new Date().toLocaleString();
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Performance System Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2 { color: #333; }
      .section { margin-bottom: 30px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; color: #333; }
      tr:hover { background-color: #f5f5f5; }
      .chart-container { width: 100%; height: 300px; margin: 20px 0; }
      .error { color: red; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body>
    <h1>Performance System Test Report</h1>
    <p>Generated: ${timestamp}</p>
    
    <div class="section">
      <h2>Page Load Performance</h2>
      <table>
        <tr>
          <th>Page</th>
          <th>DOM Content Loaded</th>
          <th>Visually Complete</th>
          <th>Notes</th>
        </tr>
  `;
  
  // Add page load data
  Object.entries(results.pageLoadTimes).forEach(([pageName, data]) => {
    html += `
      <tr>
        <td>${pageName}</td>
        <td>${data.domContentLoaded || 'N/A'}</td>
        <td>${data.visuallyComplete || 'N/A'}</td>
        <td>${data.error ? `<span class="error">${data.error}</span>` : ''}</td>
      </tr>
    `;
  });
  
  // Prepare data for page load chart
  const pageNames = Object.keys(results.pageLoadTimes);
  const domLoadTimes = pageNames.map(page => {
    const time = results.pageLoadTimes[page].domContentLoaded;
    return time ? parseInt(time) : 0;
  });
  const visualLoadTimes = pageNames.map(page => {
    const time = results.pageLoadTimes[page].visuallyComplete;
    return time ? parseInt(time) : 0;
  });
  
  html += `
    </table>
    
    <div class="chart-container">
      <canvas id="pageLoadChart"></canvas>
    </div>
    
    <div class="section">
      <h2>Form Submission Responsiveness</h2>
      <table>
        <tr>
          <th>Form</th>
          <th>Fill Time</th>
          <th>Validation Time</th>
          <th>Submit Response</th>
          <th>Notes</th>
        </tr>
  `;
  
  // Add form submission data
  Object.entries(results.formSubmissionResponsiveness).forEach(([formName, data]) => {
    html += `
      <tr>
        <td>${formName}</td>
        <td>${data.fillTime || 'N/A'}</td>
        <td>${data.validationTime || 'N/A'}</td>
        <td>${data.submitButtonResponseTime || 'N/A'}</td>
        <td>${data.error ? `<span class="error">${data.error}</span>` : ''}</td>
      </tr>
    `;
  });
  
  // Prepare data for forms chart
  const formNames = Object.keys(results.formSubmissionResponsiveness);
  const fillTimes = formNames.map(form => {
    const time = results.formSubmissionResponsiveness[form].fillTime;
    return time ? parseInt(time) : 0;
  });
  const validationTimes = formNames.map(form => {
    const time = results.formSubmissionResponsiveness[form].validationTime;
    return time ? parseInt(time) : 0;
  });
  const submitTimes = formNames.map(form => {
    const time = results.formSubmissionResponsiveness[form].submitButtonResponseTime;
    return time ? parseInt(time) : 0;
  });
  
  html += `
    </table>
    
    <div class="chart-container">
      <canvas id="formResponseChart"></canvas>
    </div>
    
    <div class="section">
      <h2>Navigation Performance</h2>
      <table>
        <tr>
          <th>Navigation Path</th>
          <th>Time</th>
          <th>Notes</th>
        </tr>
  `;
  
  // Add navigation data
  Object.entries(results.navigationDelays).forEach(([pathName, data]) => {
    html += `
      <tr>
        <td>${pathName}</td>
        <td>${data.navigationTime || 'N/A'}</td>
        <td>${data.error ? `<span class="error">${data.error}</span>` : ''}</td>
      </tr>
    `;
  });
  
  // Prepare data for navigation chart
  const pathNames = Object.keys(results.navigationDelays);
  const navigationTimes = pathNames.map(path => {
    const time = results.navigationDelays[path].navigationTime;
    return time ? parseInt(time) : 0;
  });
  
  html += `
    </table>
    
    <div class="chart-container">
      <canvas id="navigationChart"></canvas>
    </div>
    
    <div class="section">
      <h2>Performance Summary</h2>
      <p>Average page load time: ${calculateAverage(domLoadTimes)}ms (DOM), ${calculateAverage(visualLoadTimes)}ms (visual)</p>
      <p>Average form fill time: ${calculateAverage(fillTimes)}ms</p>
      <p>Average form validation time: ${calculateAverage(validationTimes)}ms</p>
      <p>Average navigation time: ${calculateAverage(navigationTimes)}ms</p>
      <p>Raw performance data saved to: performance_data.json</p>
    </div>
    
    <script>
      // Page Load Chart
      new Chart(document.getElementById('pageLoadChart'), {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(pageNames)},
          datasets: [
            {
              label: 'DOM Content Loaded (ms)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1,
              data: ${JSON.stringify(domLoadTimes)}
            },
            {
              label: 'Visually Complete (ms)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
              data: ${JSON.stringify(visualLoadTimes)}
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Page Load Times'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time (ms)'
              }
            }
          }
        }
      });
      
      // Form Response Chart
      new Chart(document.getElementById('formResponseChart'), {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(formNames)},
          datasets: [
            {
              label: 'Fill Time (ms)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
              data: ${JSON.stringify(fillTimes)}
            },
            {
              label: 'Validation Time (ms)',
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgb(153, 102, 255)',
              borderWidth: 1,
              data: ${JSON.stringify(validationTimes)}
            },
            {
              label: 'Submit Response (ms)',
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
              borderColor: 'rgb(255, 159, 64)',
              borderWidth: 1,
              data: ${JSON.stringify(submitTimes)}
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Form Response Times'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time (ms)'
              }
            }
          }
        }
      });
      
      // Navigation Chart
      new Chart(document.getElementById('navigationChart'), {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(pathNames)},
          datasets: [
            {
              label: 'Navigation Time (ms)',
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
              borderColor: 'rgb(255, 206, 86)',
              borderWidth: 1,
              data: ${JSON.stringify(navigationTimes)}
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Navigation Times'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time (ms)'
              }
            }
          }
        }
      });
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`\nPerformance test report generated: ${reportPath}`);
  console.log(`Raw performance data saved: ${jsonReportPath}`);
}

// Helper function to calculate average value from an array
function calculateAverage(arr) {
  if (!arr || arr.length === 0) return 'N/A';
  const validValues = arr.filter(val => typeof val === 'number' && !isNaN(val));
  if (validValues.length === 0) return 'N/A';
  const sum = validValues.reduce((a, b) => a + b, 0);
  return Math.round(sum / validValues.length);
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