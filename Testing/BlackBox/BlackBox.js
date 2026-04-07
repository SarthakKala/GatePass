const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create results folder if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)){
    fs.mkdirSync(resultsDir);
}

console.log('Starting Black Box Testing Suite...');
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
    const reportPath = path.join(resultsDir, 'black_box_testing_report.md');
    const date = new Date().toISOString().split('T')[0];
    
    let reportContent = `# Black Box Testing Report\n`;
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
    reportContent += `### 1. Equivalence Partitioning\n`;
    reportContent += `Tests that divide input data into partitions of equivalent data from which test cases can be derived.\n\n`;
    
    reportContent += `### 2. Boundary Value Analysis\n`;
    reportContent += `Tests that focus on the boundaries between partitions, including at the edges of boundaries.\n\n`;
    
    reportContent += `### 3. Decision Table Testing\n`;
    reportContent += `Tests that examine combinations of inputs to determine appropriate outputs.\n\n`;
    
    reportContent += `### 4. State Transition Testing\n`;
    reportContent += `Tests that validate state changes and transitions in the application.\n\n`;
    
    reportContent += `### 5. Use Case Testing\n`;
    reportContent += `Tests that verify specific user scenarios work from start to finish.\n\n`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nReport generated: ${reportPath}`);
}

// Run all tests
async function runAllTests() {
    const tests = [
        'Equivalence_Partitioning.test.js',
        'Boundary_Value_Analysis.test.js',
        'Decision_Table_Testing.test.js',
        'State_Transition_Testing.test.js',
        'Use_Case_Testing.test.js'
    ];
    
    const results = {};
    
    for (const test of tests) {
        results[test] = await runTest(test);
    }
    
    console.log('\nAll tests completed!');
    generateReport(results);
}

runAllTests();