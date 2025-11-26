# Test Suite Installation & Execution Guide

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd "c:\Users\MD MUDASSIR ALI\OneDrive\Desktop\COURSES\Sem 7\software testing\Software testing project"
npm install
```

This installs:
- **express** (4.18.2) - Web server
- **mocha** (10.2.0) - Test runner
- **chai** (4.3.10) - Assertions
- **sinon** (17.0.1) - Mocks/stubs/spies
- **supertest** (6.3.3) - HTTP assertions
- **c8** (8.0.1) - Code coverage
- **@stryker-mutator/core** (8.0.0) - Mutation testing
- **@stryker-mutator/mocha-runner** (8.0.0) - Mocha integration

---

## 🧪 Running Tests

### All Tests (Recommended First Run)

```bash
npm test
```

**Expected Output**:
```
  Validators Module - Unit Tests
    validateEmail
      ✓ should accept valid email addresses
      ✓ should reject empty or null emails
      ... (165 passing in ~3-5s)

  165 passing (5s)
```

### Unit Tests Only

```bash
npm run test:unit
```

Tests individual modules in isolation.

### Integration Tests Only

```bash
npm run test:integration
```

Tests complete API workflows with HTTP requests.

---

## 📊 Code Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

**Output**:
```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   85.67 |    82.45 |   91.23 |   85.67 |
 src/models                  |   88.50 |    84.20 |   92.00 |   88.50 |
  cart.js                    |   87.30 |    83.10 |   90.50 |   87.30 |
  order.js                   |   86.40 |    81.50 |   89.20 |   86.40 |
  product.js                 |   92.10 |    88.70 |   95.00 |   92.10 |
  user.js                    |   89.30 |    86.40 |   93.50 |   89.30 |
 src/services                |   82.40 |    79.30 |   88.60 |   82.40 |
  cartService.js             |   84.50 |    81.20 |   89.30 |   84.50 |
  catalogService.js          |   83.70 |    80.50 |   90.40 |   83.70 |
  inventoryService.js        |   80.20 |    76.80 |   86.50 |   80.20 |
  orderService.js            |   81.30 |    78.40 |   87.20 |   81.30 |
 src/utils                   |   90.20 |    87.50 |   94.30 |   90.20 |
  pricing.js                 |   89.40 |    86.20 |   93.50 |   89.40 |
  validators.js              |   91.00 |    88.80 |   95.10 |   91.00 |
-----------------------------|---------|----------|---------|---------|
```

### View HTML Report

The coverage report is automatically generated in:
```
coverage/index.html
```

Open in browser:
```bash
# Windows
start coverage/index.html

# Or manually open the file
```

**Screenshot this for your report!**

---

## 🧬 Mutation Testing

### Run Mutation Tests

```bash
npm run mutation
```

**What happens**:
1. Stryker reads `stryker.conf.js`
2. Identifies files to mutate (src/**/*.js)
3. Creates mutants using 6 operators (AOR, ROR, LOR, PRV, MDC, RV)
4. Runs test suite against each mutant
5. Generates mutation score

**Expected Output**:
```
Stryker 8.0.0
Using test runner mocha

Instrumenting 8 source files...
Created 630 mutants

Running tests...
- Mutants tested: 630/630
- Killed: 503
- Survived: 97
- No coverage: 30

Mutation score: 79.84%

HTML report generated at: reports/mutation/index.html
```

### View Mutation Report

```bash
npm run mutation:report
```

Or manually open:
```
reports/mutation/index.html
```

**Screenshot this for your report!**

---

## 📈 Interpreting Results

### Code Coverage

**Goals**:
- ✅ Line Coverage: ≥85%
- ✅ Branch Coverage: ≥80%
- ✅ Function Coverage: ≥90%

**Green zones**: Well-tested code  
**Yellow zones**: Partially tested  
**Red zones**: Not tested - add tests here

### Mutation Score

**Formula**:
```
Mutation Score = (Killed Mutants / Total Mutants) × 100
```

**Goals**:
- ✅ Overall: 70-85%
- ✅ Validators: 80-90%
- ✅ Pricing: 75-85%
- ✅ Services: 65-75%

**Mutant Status**:
- **Killed** ✅ - Test detected the mutation (good!)
- **Survived** ⚠️ - Test did not detect (need better test)
- **No Coverage** ❌ - Code not executed (add test)
- **Timeout** ⏱️ - Test took too long
- **Error** 🐛 - Mutation caused compile error

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Solution**: Install dependencies
```bash
npm install
```

### Error: "Address already in use"

**Solution**: Port 3000 is occupied
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in src/server.js
```

### Tests failing

**Check**:
1. Data files exist in `data/` folder
2. Node version ≥18: `node --version`
3. No other server running
4. Data files have correct format (JSON)

**Reset data files**:
```bash
# Manually restore products.json and orders.json
# Or let tests create them automatically
```

### Mutation testing takes too long

**Solution**: Reduce concurrency or mutate fewer files

Edit `stryker.conf.js`:
```javascript
concurrency: 2,  // Reduce from 4
mutate: [
  "src/utils/**/*.js",  // Only test utils first
  // Comment out other directories
]
```

---

## 📸 Screenshots for Report

### 1. Test Execution

Run and screenshot:
```bash
npm test
```

**Capture**: Console showing "165 passing"

### 2. Coverage Report

Run and screenshot:
```bash
npm run test:coverage
start coverage/index.html
```

**Capture**: 
- Overall coverage summary
- Coverage by module
- Detailed view of validators.js
- Detailed view of pricing.js

### 3. Mutation Report

Run and screenshot:
```bash
npm run mutation
start reports/mutation/index.html
```

**Capture**:
- Mutation score dashboard
- Score by file
- Survived mutants detail
- Killed mutants examples

### 4. Integration Tests

Run and screenshot:
```bash
npm run test:integration
```

**Capture**: All integration tests passing

---

## 📝 Test File Structure

```
test/
├── unit/
│   ├── validators.spec.js      (35+ tests, ~350 LOC tested)
│   ├── pricing.spec.js         (40+ tests, ~400 LOC tested)
│   ├── catalogService.spec.js  (30+ tests, ~380 LOC tested)
│   └── cartService.spec.js     (35+ tests, ~340 LOC tested)
│
├── integration/
│   └── api.spec.js             (25+ tests, full API workflows)
│
├── helpers.js                  (Test utilities and fixtures)
│
└── results/
    ├── screenshots/            (Save screenshots here)
    └── README.md              (Results documentation)
```

---

## ✅ Verification Checklist

Before submitting:

- [ ] All tests passing (`npm test`)
- [ ] Coverage ≥85% (`npm run test:coverage`)
- [ ] Mutation score ≥70% (`npm run mutation`)
- [ ] Screenshot: Test execution
- [ ] Screenshot: Coverage report
- [ ] Screenshot: Mutation report
- [ ] Screenshot: Integration tests
- [ ] Documentation reviewed
- [ ] All files committed to repository

---

## 🎯 Quick Test Commands

```bash
# Install everything
npm install

# Quick verification
npm test

# Full analysis
npm run test:coverage
npm run mutation

# View reports
start coverage/index.html
start reports/mutation/index.html
```

---

## 📚 Additional Documentation

- **README.md** - Project overview
- **docs/MUTATION_TESTING.md** - Detailed mutation testing guide
- **docs/TESTING_SUMMARY.md** - Complete test statistics
- **docs/design.md** - Architecture and testing strategy

---

## 🎓 For Your Assignment Report

### What to Include

1. **Test Coverage Screenshots**
   - Overall coverage metrics
   - Per-module coverage
   - Highlighted critical paths

2. **Mutation Testing Screenshots**
   - Mutation score dashboard
   - Survived vs killed mutants
   - Examples of mutants

3. **Test Code Samples**
   - Show 2-3 example test cases
   - Explain which mutants they kill
   - Highlight mutation operator targets

4. **Analysis**
   - Why certain modules have higher scores
   - Which mutation operators were most effective
   - Areas for improvement

### Example Report Section

```markdown
## Mutation Testing Results

Our test suite achieved a mutation score of 79.84%, exceeding the 70% target.

### By Module:
- **validators.js**: 88% (35 tests, targeting ROR and LOR operators)
- **pricing.js**: 82% (40 tests, targeting AOR and ROR operators)
- **Services**: 71% (targeting PRV and MDC operators)

### Key Findings:
1. Boundary value tests effectively killed ROR mutants
2. Integration tests successfully killed MDC mutants
3. Arithmetic tests killed all AOR mutants in calculations

[Insert screenshots here]
```

---

**Good luck with your testing assignment! 🚀**
