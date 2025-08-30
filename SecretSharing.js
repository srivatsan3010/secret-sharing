/**
 * SecretSharing.js
 * Main class implementing Shamir's Secret Sharing algorithm
 */

const { baseToDecimal, getCombinations } = require('./utils');

class SecretSharing {
    constructor() {
        this.shares = [];  // Array to store decoded shares
        this.n = 0;        // Total number of shares
        this.k = 0;        // Minimum shares needed
    }

    /**
     * Parse JSON input and decode all shares
     * @param {Object} jsonData - The input JSON data
     */
    parseInput(jsonData) {
        console.log("\n" + "=".repeat(50));
        console.log("📥 PARSING INPUT DATA");
        console.log("=".repeat(50));
        
        this.n = jsonData.keys.n;
        this.k = jsonData.keys.k;
        this.shares = [];

        console.log(`📊 Configuration:`);
        console.log(`   Total shares (n): ${this.n}`);
        console.log(`   Minimum needed (k): ${this.k}`);
        console.log(`   Polynomial degree: ${this.k - 1}`);
        console.log();

        // Parse each share
        for (let i = 1; i <= this.n; i++) {
            const shareKey = i.toString();
            
            if (jsonData[shareKey]) {
                const shareData = jsonData[shareKey];
                console.log(`🏷️  Processing Share ${i}:`);
                console.log(`   Base: ${shareData.base}`);
                console.log(`   Value: "${shareData.value}"`);
                
                try {
                    const x = BigInt(i);  // x-coordinate is share index
                    const y = baseToDecimal(shareData.value, parseInt(shareData.base));
                    
                    this.shares.push({
                        x: x,
                        y: y,
                        index: i,
                        original: shareData
                    });
                    
                    console.log(`   ✅ Success: (${x}, ${y})\n`);
                    
                } catch (error) {
                    console.error(`   ❌ Error: ${error.message}\n`);
                    throw error;
                }
            }
        }

        console.log(`✅ Parsed ${this.shares.length} shares successfully`);
        this._displayShares();
    }

    /**
     * Display all decoded shares
     * @private
     */
    _displayShares() {
        console.log(`\n📋 DECODED SHARES:`);
        this.shares.forEach(share => {
            console.log(`   Share ${share.index}: (x=${share.x}, y=${share.y})`);
        });
        console.log();
    }

    /**
     * Lagrange interpolation to find f(0) - the secret
     * @param {Array} points - Array of points to interpolate
     * @returns {BigInt} - The secret (constant term)
     */
    lagrangeInterpolation(points) {
        console.log(`🧮 LAGRANGE INTERPOLATION`);
        console.log(`   Using points: [${points.map(p => `Share ${p.index}`).join(', ')}]`);
        
        let secret = BigInt(0);

        for (let i = 0; i < points.length; i++) {
            console.log(`\n   🔍 Point ${i + 1}: Share ${points[i].index} = (${points[i].x}, ${points[i].y})`);
            
            let numerator = BigInt(1);
            let denominator = BigInt(1);

            // Calculate Lagrange basis polynomial Li(0)
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    const numFactor = BigInt(0) - points[j].x;  // (0 - xj)
                    const denFactor = points[i].x - points[j].x; // (xi - xj)
                    
                    numerator *= numFactor;
                    denominator *= denFactor;
                    
                    console.log(`      Factor: (0 - ${points[j].x}) / (${points[i].x} - ${points[j].x})`);
                }
            }

            console.log(`      Numerator: ${numerator}`);
            console.log(`      Denominator: ${denominator}`);

            // Ensure exact division
            if (numerator % denominator !== BigInt(0)) {
                throw new Error(`Non-exact division: ${numerator} ÷ ${denominator}`);
            }

            const coefficient = numerator / denominator;
            const contribution = points[i].y * coefficient;
            
            console.log(`      Coefficient: ${coefficient}`);
            console.log(`      Contribution: ${points[i].y} × ${coefficient} = ${contribution}`);
            
            secret += contribution;
        }

        console.log(`\n   🎯 SECRET (f(0)): ${secret}`);
        return secret;
    }

    /**
     * Validate if a point lies on the polynomial defined by given points
     * @param {Object} testPoint - Point to validate
     * @param {Array} polynomialPoints - Points defining the polynomial
     * @returns {boolean} - True if point is valid
     */
    validatePoint(testPoint, polynomialPoints) {
        console.log(`    🔍 Validating Share ${testPoint.index}: (${testPoint.x}, ${testPoint.y})`);
        
        try {
            let expectedY = BigInt(0);

            // Use Lagrange interpolation to calculate expected y-value
            for (let i = 0; i < polynomialPoints.length; i++) {
                let numerator = BigInt(1);
                let denominator = BigInt(1);

                for (let j = 0; j < polynomialPoints.length; j++) {
                    if (i !== j) {
                        numerator *= (testPoint.x - polynomialPoints[j].x);
                        denominator *= (polynomialPoints[i].x - polynomialPoints[j].x);
                    }
                }

                if (numerator % denominator !== BigInt(0)) {
                    console.log(`      ❌ Non-exact division in validation`);
                    return false;
                }

                expectedY += polynomialPoints[i].y * (numerator / denominator);
            }

            const isValid = expectedY === testPoint.y;
            console.log(`      Expected: ${expectedY}`);
            console.log(`      Actual:   ${testPoint.y}`);
            console.log(`      Status:   ${isValid ? '✅ VALID' : '❌ INVALID'}`);
            
            return isValid;
            
        } catch (error) {
            console.log(`      ❌ Validation error: ${error.message}`);
            return false;
        }
    }

    /**
     * Main solving method - find secret and detect wrong shares
     * @returns {Object} - Result containing secret and wrong shares
     */
    solve() {
        console.log("\n" + "=".repeat(60));
        console.log("🚀 STARTING SECRET RECOVERY");
        console.log("=".repeat(60));
        
        const combinations = getCombinations(this.shares, this.k);
        console.log(`\n📊 Analysis:`);
        console.log(`   Total combinations to test: ${combinations.length}`);
        console.log(`   Formula: C(${this.n}, ${this.k}) = ${combinations.length}`);
        console.log(`\n⏳ Testing each combination systematically...\n`);

        let validSecret = null;
        let wrongShares = [];
        let attemptCount = 0;

        for (let combo of combinations) {
            attemptCount++;
            const indices = combo.map(s => s.index).sort((a, b) => a - b);
            
            console.log(`${"─".repeat(50)}`);
            console.log(`🔧 ATTEMPT ${attemptCount}/${combinations.length}`);
            console.log(`   Testing shares: [${indices.join(', ')}]`);
            console.log(`${"─".repeat(50)}`);

            try {
                // Calculate secret using this combination
                const secret = this.lagrangeInterpolation(combo);

                // Validate against remaining shares
                console.log(`\n🔍 VALIDATING REMAINING SHARES...`);
                let isValid = true;
                let currentWrongShares = [];

                for (let share of this.shares) {
                    if (!combo.some(c => c.index === share.index)) {
                        if (!this.validatePoint(share, combo)) {
                            isValid = false;
                            currentWrongShares.push(share);
                        }
                    }
                }

                console.log(`\n📊 VALIDATION RESULTS:`);
                console.log(`   Shares tested: ${this.shares.length - combo.length}`);
                console.log(`   Invalid shares: ${currentWrongShares.length}`);

                if (isValid) {
                    console.log(`\n🎉 SUCCESS! VALID POLYNOMIAL FOUND!`);
                    console.log(`🔐 Secret: ${secret}`);
                    console.log(`✅ All remaining shares fit perfectly`);
                    
                    validSecret = secret;
                    wrongShares = currentWrongShares;
                    break;
                    
                } else {
                    const wrongIndices = currentWrongShares.map(s => s.index).join(', ');
                    console.log(`\n❌ INVALID COMBINATION`);
                    console.log(`   Shares [${wrongIndices}] don't fit this polynomial`);
                }

            } catch (error) {
                console.log(`\n💥 ERROR: ${error.message}`);
            }
        }

        return { 
            secret: validSecret, 
            wrongShares: wrongShares,
            totalAttempts: attemptCount,
            totalCombinations: combinations.length
        };
    }
}

module.exports = SecretSharing;