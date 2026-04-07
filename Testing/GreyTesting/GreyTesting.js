const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create results folder if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)){
    fs.mkdirSync(resultsDir);
}

console.log('Starting Grey Box Testing Suite...');
console.log('==================================');

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
    const reportPath = path.join(resultsDir, 'grey_box_testing_report.md');
    const date = new Date().toISOString().split('T')[0];
    
    let reportContent = `# Grey Box Testing Report\n`;
    reportContent += `Date: ${date}\n\n`;
    reportContent += `## Test Results Summary\n\n`;
    
    // Add table of results
    reportContent += `| Test Type | Status | Details |\n`;
    reportContent += `|-----------|--------|--------|\n`;
    
    Object.keys(results).forEach(test => {
        const status = results[test] ? '✓ Pass' : '✗ Fail';
        const resultFile = `${path.basename(test, '.js')}_results.txt`;
        reportContent += `| ${path.basename(test, '.js')} | ${status} | [Results](${resultFile}) |\n`;
    });
    
    reportContent += `\n## Details\n\n`;
    reportContent += `### 1. Matrix Testing\n`;
    reportContent += `Tests that verify combinations of inputs and components interact correctly.\n\n`;
    
    reportContent += `### 2. Regression Testing\n`;
    reportContent += `Tests that ensure new changes haven't broken existing functionality.\n\n`;
    
    reportContent += `### 3. Pattern Testing\n`;
    reportContent += `Tests that verify specific patterns and workflows in the application.\n\n`;
    
    reportContent += `### 4. Orthogonal Array Testing\n`;
    reportContent += `Tests that use statistical methods to reduce the number of test combinations while maintaining coverage.\n\n`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nReport generated: ${reportPath}`);
}

// Run all tests
async function runAllTests() {
    const tests = [
        'Matrix_Testing.test.js',
        'Regression_Testing.test.js',
        'Pattern_Testing.test.js',
        'Orthogonal_Array_Testing.test.js'
    ];
    
    const results = {};
    
    for (const test of tests) {
        results[test] = await runTest(test);
    }
    
    console.log('\nAll tests completed!');
    generateReport(results);
}

runAllTests();