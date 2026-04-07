const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create results folder if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)){
    fs.mkdirSync(resultsDir);
}

console.log('Starting Integration Testing Suite...');
console.log('====================================');

// Function to run a test file and capture output
function runTest(testFile) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const outputFile = path.join(resultsDir, `${path.basename(testFile, '.js')}_results.txt`);
        
        console.log(`Running ${testFile}...`);
        
        exec(`node "${path.join(__dirname, testFile)}"`, (error, stdout, stderr) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            
            // Save results to file
            fs.writeFileSync(outputFile, `Test Results: ${testFile}\n`);
            fs.appendFileSync(outputFile, `Duration: ${duration} seconds\n\n`);
            fs.appendFileSync(outputFile, `STDOUT:\n${stdout}\n\n`);
            
            if (stderr) {
                fs.appendFileSync(outputFile, `STDERR:\n${stderr}\n\n`);
            }
            
            if (error) {
                fs.appendFileSync(outputFile, `ERROR:\n${error.message}\n\n`);
                console.error(`  ✗ Failed (${duration}s) - See ${outputFile} for details`);
                resolve(false);
            } else {
                console.log(`  ✓ Completed successfully (${duration}s)`);
                resolve(true);
            }
        });
    });
}

// Generate report file
function generateReport(results) {
    const reportPath = path.join(resultsDir, 'integration_testing_report.md');
    const date = new Date().toISOString().split('T')[0];
    
    let reportContent = `# Integration Testing Report\n`;
    reportContent += `Date: ${date}\n\n`;
    reportContent += `## Test Results Summary\n\n`;
    
    // Add table of results
    reportContent += `| Integration Approach | Status | Details |\n`;
    reportContent += `|---------------------|--------|--------|\n`;
    
    Object.keys(results).forEach(test => {
        const status = results[test] ? '✓ Pass' : '✗ Fail';
        const resultFile = `${path.basename(test, '.js')}_results.txt`;
        reportContent += `| ${path.basename(test, '.test.js')} | ${status} | [Results](${resultFile}) |\n`;
    });
    
    reportContent += `\n## Integration Testing Approaches\n\n`;
    reportContent += `### 1. Top-Down Integration Testing\n`;
    reportContent += `Tests the high-level modules first and gradually adds lower-level modules, using stubs for missing components.\n\n`;
    
    reportContent += `### 2. Bottom-Up Integration Testing\n`;
    reportContent += `Tests the low-level modules first and gradually combines them into higher-level modules, using drivers for testing.\n\n`;
    
    reportContent += `### 3. Hybrid Integration Testing\n`;
    reportContent += `Combines both top-down and bottom-up approaches to test critical paths and complex interactions.\n\n`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nReport generated: ${reportPath}`);
}

// Run all tests
async function runAllTests() {
    const tests = [
        'Top_Down.test.js',
        'Bottom_Up.test.js',
        'Hybrid_Integration.test.js'
    ];
    
    const results = {};
    
    for (const test of tests) {
        results[test] = await runTest(test);
    }
    
    console.log('\nAll tests completed!');
    generateReport(results);
}

runAllTests();