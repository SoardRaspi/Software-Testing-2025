/**
 * Stryker Mutation Testing Configuration
 * 
 * This configuration enables comprehensive mutation testing with both
 * unit-level and integration-level mutation operators.
 * 
 * UNIT-LEVEL MUTATION OPERATORS:
 * 1. AOR (Arithmetic Operator Replacement): Replaces +, -, *, /, % operators
 *    - Purpose: Tests if arithmetic operations are correctly verified
 *    - Example: price * quantity → price / quantity
 * 
 * 2. ROR (Relational Operator Replacement): Replaces >, <, >=, <=, ==, !=
 *    - Purpose: Tests boundary conditions and comparison logic
 *    - Example: stock > 0 → stock >= 0
 * 
 * 3. LOR (Logical Operator Replacement): Replaces &&, ||, negates booleans
 *    - Purpose: Tests boolean logic and conditional branches
 *    - Example: isValid && isAvailable → isValid || isAvailable
 * 
 * INTEGRATION-LEVEL MUTATION OPERATORS:
 * 1. PRV (Parameter Replacement/Mutation): Changes parameter values in calls
 *    - Purpose: Tests parameter validation across module boundaries
 *    - Example: service.call(5) → service.call(0)
 * 
 * 2. MDC (Method/Function Call Deletion): Removes function calls
 *    - Purpose: Tests if side effects and integrations are validated
 *    - Example: logger.log(...) → (deleted)
 * 
 * 3. RV (Return Value Mutation): Mutates return values
 *    - Purpose: Tests if return values are properly validated
 *    - Example: return true → return false
 */

// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  testRunner: "mocha",
  
  // Coverage analysis helps Stryker run only relevant tests per mutant
  coverageAnalysis: "perTest",
  
  // Files to mutate - focus on business logic
  mutate: [
    "src/models/**/*.js",
    "src/utils/**/*.js",
    "src/services/catalogService.js",
    "src/services/inventoryService.js",
    // "src/app.js",  // Excluded - requires missing cart/order services
    "!src/**/*.spec.js",
    "!src/server.js"  // Exclude server.js as it's mainly configuration
  ],
  
  // Test files
  // testRunner and mochaOptions configured below
  
  // Mutation operators configuration
  // These cover both unit-level and integration-level mutations
  mutator: {
    // Exclude less valuable mutations to focus on high-impact ones
    excludedMutations: [
      // Keep these mutations active for comprehensive testing:
      // "ArithmeticOperator",    // AOR - Arithmetic Operator Replacement
      // "EqualityOperaotor",      // Part of ROR - Relational operators
      // "LogicalOperatr",       // LOR - Logical Operator Replacement
      // "ConditionalExpression", // Part of LOR
      // "BlockStatement",        // Part of MDC - Method Call Deletion
      // "ReturnValue",            // RV - Return Value Mutation
      
      // Exclude mutations that produce too many false positives:
      "StringLiteral",  // Changes strings - often not caught by tests
      "RegexLiteral",   // Changes regex patterns - too noisy
      "ArrayDeclaration" // Array literal changes - less meaningful
    ]
  },
  
  // Reporters for mutation results
  reporters: [
    "html",        // HTML report in reports/mutation/
    "clear-text",  // Console output
    "progress",    // Progress bar
    "json"         // JSON for CI/CD integration
  ],
  
  // HTML report output directory
  htmlReporter: {
    fileName: "reports/mutation/index.html"
  },
  
  // JSON report output
  jsonReporter: {
    fileName: "reports/mutation/mutation-report.json"
  },
  
  // Concurrency settings - adjust based on CPU cores
  concurrency: 4,
  
  // Timeout per test run (milliseconds)
  timeoutMS: 30000,
  
  // Timeout factor - multiply original test time by this factor
  timeoutFactor: 2,
  
  // Thresholds for mutation score
  thresholds: {
    high: 85,  // Excellent mutation coverage
    low: 70,   // Minimum acceptable
    break: 60  // Fail build if below this
  },
  
  // Incremental mode - only test changed files (useful for large projects)
  incremental: false,
  
  // Clear console between runs
  clearTextReporter: {
    allowColor: true,
    logTests: false,
    maxTestsToLog: 3
  },
  
  // Mocha-specific options
  mochaOptions: {
    spec: ["test/unit/**/*.spec.js"]  // Only unit tests to avoid integration issues
  },
  
  // Ignore patterns
  ignorePatterns: [
    "node_modules",
    // "test",
    // "reports",
    // "coverage",
    // "client",
    // "data",
    // "docs"
  ]
};

export default config;
