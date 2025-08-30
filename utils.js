/**
 * utils.js
 * Utility functions for base conversion and mathematical operations
 */

/**
 * Convert a number from any base (2-36) to decimal using BigInt
 * @param {string} value - The number string in the given base
 * @param {number} base - The base of the input number (2-36)
 * @returns {BigInt} - The decimal representation as BigInt
 */
function baseToDecimal(value, base) {
    console.log(`  🔢 Converting "${value}" from base ${base} to decimal`);
    
    const baseNum = BigInt(base);
    let result = BigInt(0);
    let power = BigInt(1);
    
    // Process digits from right to left
    for (let i = value.length - 1; i >= 0; i--) {
        let digit;
        const char = value[i].toLowerCase();
        
        // Handle digits 0-9
        if (char >= '0' && char <= '9') {
            digit = BigInt(char);
        } 
        // Handle letters a-z for bases > 10
        else if (char >= 'a' && char <= 'z') {
            digit = BigInt(char.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        } 
        else {
            throw new Error(`Invalid character '${char}' for base ${base}`);
        }
        
        // Validate digit is within base range
        if (digit >= baseNum) {
            throw new Error(`Invalid digit '${char}' (value ${digit}) for base ${base}`);
        }
        
        result += digit * power;
        power *= baseNum;
    }
    
    console.log(`  ➡️  Decimal value: ${result}`);
    return result;
}

/**
 * Generate all combinations of k elements from an array
 * @param {Array} array - Input array
 * @param {number} k - Number of elements to choose
 * @returns {Array} - Array of all possible combinations
 */
function getCombinations(array, k) {
    if (k === 1) return array.map(x => [x]);
    if (k === array.length) return [array];

    const result = [];
    
    for (let i = 0; i <= array.length - k; i++) {
        const head = array[i];
        const tailCombs = getCombinations(array.slice(i + 1), k - 1);
        tailCombs.forEach(tailComb => result.push([head, ...tailComb]));
    }
    
    return result;
}

/**
 * Format large numbers for display
 * @param {BigInt} num - The BigInt number to format
 * @returns {string} - Formatted string representation
 */
function formatNumber(num) {
    const str = num.toString();
    if (str.length > 20) {
        return str.substring(0, 10) + '...' + str.substring(str.length - 10);
    }
    return str;
}

module.exports = {
    baseToDecimal,
    getCombinations,
    formatNumber
};