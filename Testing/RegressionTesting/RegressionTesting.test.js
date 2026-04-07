const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const TIMEOUT = 1500; 

class RegressionTest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        let driver;
        try {
            const options = new chrome.Options();
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();

            console.log('Starting Regression Tests...\n');

            // Test Suite 1: Authentication Flows
            await this.testAuthenticationFlows(driver);

            // Test Suite 2: Leave Application Flow
            await this.testLeaveApplicationFlow(driver);

            // Test Suite 3: Admin Functions
            await this.testAdminFunctions(driver);

            // Generate HTML Report
            await this.generateHTMLReport();

        } catch (error) {
            console.error('Test runner failed:', error);
        } finally {
            if (driver) {
                await driver.quit();
            }
        }
    }

    async testAuthenticationFlows(driver) {
        // Test 1: Student Registration
        await this.runTestCase(driver, 'Student Registration', async () => {
            await driver.get('http://localhost:5173/signup');
            await driver.sleep(TIMEOUT);

            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Name']"))
                .sendKeys('Test Student');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"))
                .sendKeys('test@student.com');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"))
                .sendKeys('test123');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Parents Email']"))
                .sendKeys('parent@test.com');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Hostel Name']"))
                .sendKeys('Test Hostel');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Roll No']"))
                .sendKeys('TEST123');

            await driver.sleep(TIMEOUT);
            const signupBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Signup')]"));
            if (!await signupBtn.isEnabled()) {
                throw new Error('Signup button should be enabled with valid inputs');
            }
        });

        // Test 2: Student Login
        await this.runTestCase(driver, 'Student Login', async () => {
            await driver.get('http://localhost:5173/signin');
            await driver.sleep(TIMEOUT);

            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"))
                .sendKeys('test@student.com');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"))
                .sendKeys('test123');

            await driver.sleep(TIMEOUT);
            const signinBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
            if (!await signinBtn.isEnabled()) {
                throw new Error('Signin button should be enabled with valid inputs');
            }
        });
    }

    async testLeaveApplicationFlow(driver) {
        // Test 3: Leave Application Form
        await this.runTestCase(driver, 'Leave Application Form', async () => {
            await driver.get('http://localhost:5173/dash');
            await driver.sleep(TIMEOUT);

            await driver.findElement(By.xpath("//input[@placeholder='Select From Date']"))
                .sendKeys(this.getCurrentDate());
            await driver.findElement(By.xpath("//input[@placeholder='Select To Date']"))
                .sendKeys(this.getFutureDate(3));
            await driver.findElement(By.xpath("//input[@placeholder='Enter Destination']"))
                .sendKeys('Test Location');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Reason']"))
                .sendKeys('Regression Testing');

            await driver.sleep(TIMEOUT);
            const submitBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
            if (!await submitBtn.isEnabled()) {
                throw new Error('Submit button should be enabled with valid inputs');
            }
        });

        // Test 4: Status Tracking
        await this.runTestCase(driver, 'Status Tracking', async () => {
            await driver.get('http://localhost:5173/waiting');
            await driver.sleep(TIMEOUT);

            const statusSteps = await driver.findElements(
                By.className('relative flex items-center space-x-4 py-4 group')
            );
            if (statusSteps.length < 3) {
                throw new Error('Status page should display at least 3 status steps');
            }
        });
    }

    async testAdminFunctions(driver) {
        // Test 5: Admin Login
        await this.runTestCase(driver, 'Admin Login', async () => {
            await driver.get('http://localhost:5173/adminsignin');
            await driver.sleep(TIMEOUT);

            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"))
                .sendKeys('admin@test.com');
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"))
                .sendKeys('admin123');

            await driver.sleep(TIMEOUT);
            const adminSigninBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]"));
            if (!await adminSigninBtn.isEnabled()) {
                throw new Error('Admin signin button should be enabled with valid inputs');
            }
        });

        // Test 6: Admin Dashboard
        await this.runTestCase(driver, 'Admin Dashboard', async () => {
            await driver.get('http://localhost:5173/admindash');
            await driver.sleep(TIMEOUT);

            const headings = await driver.findElements(
                By.xpath("//h1[contains(text(), 'Admin') or contains(text(), 'Dashboard')]")
            );
            if (headings.length === 0) {
                throw new Error('Admin dashboard should display proper heading');
            }

            const actionButtons = await driver.findElements(
                By.xpath("//button[contains(text(), 'Allow') or contains(text(), 'Deny')]")
            );
            await driver.sleep(TIMEOUT);
        });
    }

    async runTestCase(driver, testName, testFn) {
        const test = {
            name: testName,
            startTime: new Date(),
            status: 'FAILED',
            error: null
        };

        try {
            await testFn();
            test.status = 'PASSED';
            this.results.passed++;
            console.log(`✅ ${testName} - Passed`);
        } catch (error) {
            test.error = error.message;
            this.results.failed++;
            console.log(`❌ ${testName} - Failed: ${error.message}`);
        }

        test.endTime = new Date();
        test.duration = (test.endTime - test.startTime) / 1000;
        this.results.total++;
        this.results.tests.push(test);
    }

    async generateHTMLReport() {
        const reportDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, 'regression_test_report.html');
        const template = this.getReportTemplate();
        fs.writeFileSync(reportPath, template);
        console.log(`\nReport generated: ${reportPath}`);
    }

    getReportTemplate() {
        const timestamp = new Date().toLocaleString();
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Regression Test Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #2c3e50; margin-bottom: 10px; }
                .summary { display: flex; gap: 20px; margin: 20px 0; }
                .summary-item { border-radius: 5px; padding: 10px 20px; }
                .total { background-color: #f8f9fa; border: 1px solid #dee2e6; }
                .passed { background-color: #d4edda; color: #155724; }
                .failed { background-color: #f8d7da; color: #721c24; }
                .test-case { margin-bottom: 15px; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; }
                .test-case.passed { border-left: 5px solid #28a745; }
                .test-case.failed { border-left: 5px solid #dc3545; }
                .test-header { display: flex; justify-content: space-between; align-items: center; }
                .test-title { margin: 0; }
                .test-status { font-weight: bold; }
                .status-passed { color: #28a745; }
                .status-failed { color: #dc3545; }
                .test-details { margin-top: 10px; }
                .test-duration { color: #6c757d; }
                .error-message { padding: 10px; background-color: #f8f9fa; border-left: 3px solid #dc3545; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>Gate Pass System - Regression Test Report</h1>
            <p>Generated: ${timestamp}</p>

            <div class="summary">
                <div class="summary-item total">
                    <strong>Total Tests:</strong> ${this.results.total}
                </div>
                <div class="summary-item passed">
                    <strong>Passed:</strong> ${this.results.passed}
                </div>
                <div class="summary-item failed">
                    <strong>Failed:</strong> ${this.results.failed}
                </div>
            </div>

            ${this.results.tests.map(test => `
                <div class="test-case ${test.status.toLowerCase()}">
                    <div class="test-header">
                        <h3 class="test-title">${test.name}</h3>
                        <span class="test-status status-${test.status.toLowerCase()}">${test.status}</span>
                    </div>
                    <div class="test-details">
                        <p class="test-duration">Duration: ${test.duration.toFixed(2)}s</p>
                        ${test.error ? `<div class="error-message">${test.error}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </body>
        </html>`;
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}

// Run the tests
const regressionTest = new RegressionTest();
regressionTest.runTests();