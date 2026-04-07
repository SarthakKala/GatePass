const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class GatePassVolumeTest {
    constructor(baseUrl = 'http://localhost:5173') {
        this.baseUrl = baseUrl;
        this.metrics = {
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTimes: []
        };
    }

    async createDriver() {
        const options = new chrome.Options();
        options.addArguments('--headless'); // Run in headless mode
        return await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    }

    async simulateUserJourney(userId) {
        console.log(`\nStarting journey for user ${userId}...`);
        const driver = await this.createDriver();
        const startTime = Date.now();
        
        try {
            // Login
            console.log(`User ${userId}: Navigating to login page...`);
            await driver.get(`${this.baseUrl}/signin`);
            
            console.log(`User ${userId}: Entering credentials...`);
            await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Enter Your Email']")), 10000);
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Email']"))
                .sendKeys(`test${userId}@example.com`);
            await driver.findElement(By.xpath("//input[@placeholder='Enter Your Password']"))
                .sendKeys('password123');
            
            console.log(`User ${userId}: Attempting login...`);
            await driver.findElement(By.xpath("//button[contains(text(), 'Signin')]")).click();

            // Wait for dashboard with increased timeout
            console.log(`User ${userId}: Waiting for dashboard...`);
            await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Dashboard')]")), 15000);

            // Create gate pass request
            console.log(`User ${userId}: Creating gate pass request...`);
            await driver.wait(until.elementLocated(By.id('create-pass-btn')), 10000);
            await driver.findElement(By.id('create-pass-btn')).click();
            
            // Wait for form elements and fill them
            await driver.wait(until.elementLocated(By.name('reason')), 10000);
            await driver.findElement(By.name('reason')).sendKeys(`Volume Test Request - User ${userId}`);
            await driver.findElement(By.name('fromDate')).sendKeys('2025-05-22');
            await driver.findElement(By.name('toDate')).sendKeys('2025-05-23');
            
            console.log(`User ${userId}: Submitting request...`);
            await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]")).click();
            
            // Wait for submission confirmation (adjust xpath according to your UI)
            await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Success') or contains(text(), 'submitted')]")), 10000);

            this.metrics.successfulRequests++;
            const responseTime = Date.now() - startTime;
            this.metrics.totalResponseTimes.push(responseTime);
            console.log(`User ${userId}: Journey completed successfully in ${(responseTime/1000).toFixed(2)} seconds`);

        } catch (error) {
            console.error(`User ${userId} Error:`, error.message);
            this.metrics.failedRequests++;
        } finally {
            await driver.quit();
            console.log(`User ${userId}: Browser session closed`);
        }
    }

    async runVolumeTest(numberOfUsers = 50) {
        console.log(`\n=== Starting volume test with ${numberOfUsers} concurrent users ===`);
        console.log('Each user will attempt to login and create a gate pass');
        const startTime = Date.now();

        // Create array of promises for concurrent user journeys
        const userJourneys = Array.from({ length: numberOfUsers }, (_, i) => 
            this.simulateUserJourney(i + 1)
        );

        // Run all user journeys concurrently with a global timeout
        await Promise.race([
            Promise.all(userJourneys),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Volume test timeout after 5 minutes')), 300000)
            )
        ]);

        // Calculate metrics
        const totalTime = Date.now() - startTime;
        this.metrics.averageResponseTime = this.metrics.totalResponseTimes.reduce((a, b) => a + b, 0) / 
            this.metrics.totalResponseTimes.length;

        this.printResults(totalTime, numberOfUsers);
    }

    printResults(totalTime, numberOfUsers) {
        console.log('\n=== Volume Test Results ===');
        console.log(`Total Users: ${numberOfUsers}`);
        console.log(`Total Time: ${totalTime / 1000} seconds`);
        console.log(`Successful Requests: ${this.metrics.successfulRequests}`);
        console.log(`Failed Requests: ${this.metrics.failedRequests}`);
        console.log(`Average Response Time: ${this.metrics.averageResponseTime / 1000} seconds`);
        console.log(`Success Rate: ${(this.metrics.successfulRequests / numberOfUsers * 100).toFixed(2)}%`);
        console.log('========================\n');
    }
}

// Run the volume test
(async () => {
    const volumeTest = new GatePassVolumeTest();
    try {
        await volumeTest.runVolumeTest(50); // Test with 50 concurrent users
    } catch (error) {
        console.error('Volume test failed:', error.message);
    }
})();