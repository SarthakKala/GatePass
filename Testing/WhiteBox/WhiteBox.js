const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create results folder if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)){
    fs.mkdirSync(resultsDir);
}

console.log('Starting White Box Testing Suite...');
console.log('===================================');

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
    const reportPath = path.join(resultsDir, 'white_box_testing_report.md');
    const date = new Date().toISOString().split('T')[0];
    
    let reportContent = `# White Box Testing Report\n`;
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
    reportContent += `### Statement Coverage\n`;
    reportContent += `Tests that execute every statement in the code at least once.\n\n`;
    
    reportContent += `### Branch Coverage\n`;
    reportContent += `Tests that execute each decision point (if/else) in both true and false directions.\n\n`;
    
    reportContent += `### Condition Coverage\n`;
    reportContent += `Tests that evaluate each boolean sub-expression to both true and false.\n\n`;
    
    reportContent += `### Path Coverage\n`;
    reportContent += `Tests that execute all possible paths through the code.\n\n`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nReport generated: ${reportPath}`);
}

// Run all tests
async function runAllTests() {
    const tests = [
        //4 test files for white box testing
        'Statement_Coverage.test.js',
        'Decision_or_Branch_Coverage.test.js',
        'Condition_Coverage.test.js',
        'Path_Coverage.test.js'
    ];
    
    const results = {};
    
    for (const test of tests) {
        results[test] = await runTest(test);
    }
    
    console.log('\nAll tests completed!');
    generateReport(results);
}

runAllTests();