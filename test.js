/**
 * test.js
 * Test runner and main entry point for the Shamir's Secret Sharing solution
 */

const SecretSharing = require('./SecretSharing');

/**
 * Run a test case and display results
 * @param {Object} testCase - The JSON test case data
 * @param {string} caseName - Name of the test case for display
 */
function runTest(testCase, caseName) {
    console.log("\n" + "=".repeat(70));
    console.log(`🧪 ${caseName}`);
    console.log("=".repeat(70));

    const solver = new SecretSharing();
    
    try {
        // Parse input and solve
        solver.parseInput(testCase);
        const result = solver.solve();
        
        // Display final results
        console.log("\n" + "=".repeat(40));
        console.log("📋 FINAL RESULTS");
        console.log("=".repeat(40));
        
        if (result.secret !== null) {
            console.log(`\n🔐 SECRET: ${result.secret}`);
            
            if (result.wrongShares && result.wrongShares.length > 0) {
                const wrongIndices = result.wrongShares.map(s => s.index).join(', ');
                console.log(`🚨 WRONG SHARES: [${wrongIndices}]`);
                
                console.log(`\n📝 Wrong share details:`);
                result.wrongShares.forEach(share => {
                    console.log(`   Share ${share.index}: base ${share.original.base}, value "${share.original.value}"`);
                });
            } else {
                console.log(`✅ WRONG SHARES: None detected`);
            }
            
            console.log(`\n📊 STATISTICS:`);
            console.log(`   Combinations tested: ${result.totalAttempts}/${result.totalCombinations}`);
            console.log(`   Success rate: ${((result.totalAttempts/result.totalCombinations) * 100).toFixed(1)}%`);
            
        } else {
            console.log("\n❌ FAILED: Could not find a valid secret!");
            console.log(`   Tested all ${result.totalCombinations} combinations without success`);
        }
        
    } catch (error) {
        console.error(`\n💥 FATAL ERROR: ${error.message}`);
        console.error(`📍 Stack trace:\n${error.stack}`);
    }

    console.log("\n" + "=".repeat(70));
}

// Test Case 1 - Simple example with small numbers
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

// Test Case 2 - Complex example with large numbers
const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d635"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Main execution
console.log("🎯 SHAMIR'S SECRET SHARING SOLUTION");


// Run both test cases
runTest(testCase1, "TEST CASE 1 - SIMPLE EXAMPLE");
runTest(testCase2, "TEST CASE 2 - COMPLEX WITH LARGE NUMBERS");

console.log("\n✨ EXECUTION COMPLETED!");
console.log("📤 Solution ready for GitHub submission");
console.log("🔗 Don't forget to add your repository URL to the submission form");