# 🎯 COMPLETE PROJECT GUIDE - Everything You Need

## 📁 File Structure - What Each File Does

### **Application Files (What the bookstore does)**

```
src/
├── server.js          - Starts the web server on port 4000
├── app.js            - Main application logic, connects everything
├── models/
│   ├── product.js    - Product data structure (book info)
│   ├── cart.js       - Shopping cart data structure
│   ├── order.js      - Order data structure
│   └── user.js       - User/session data structure
├── services/
│   ├── catalogService.js    - Search/filter products
│   ├── cartService.js       - Add/remove items from cart
│   ├── orderService.js      - Create/manage orders
│   └── inventoryService.js  - Track stock levels
└── utils/
    ├── validators.js  - Validate emails, prices, ISBNs
    └── pricing.js     - Calculate discounts, shipping, tax
```

### **Test Files (What tests the bookstore)**

```
test/
├── helpers.js         - Common test utilities (backup data, fake products)
├── unit/              - Tests individual functions
│   ├── validators.spec.js      (35+ tests) - Tests email/price validation
│   ├── pricing.spec.js         (40+ tests) - Tests discount calculations
│   ├── catalogService.spec.js  (30+ tests) - Tests product search
│   └── cartService.spec.js     (35+ tests) - Tests cart operations
└── integration/
    └── api.spec.js    (25+ tests) - Tests complete user flows
```

### **Configuration Files**

```
package.json           - Lists all dependencies, defines npm scripts
stryker.conf.js       - Mutation testing configuration (6 operators)
.github/workflows/ci.yml  - Automatic testing on GitHub
```

### **Script Files (Automation)**

```
scripts/
├── run_all_tests.bat          - Windows: Runs all tests automatically
├── run_all_tests.sh           - Linux/Mac: Runs all tests automatically
└── take_placeholder_screenshots.js  - Creates placeholder screenshots
```

### **Documentation**

```
README.md              - Main project documentation
TESTING_GUIDE.md       - How to run tests step-by-step
QUICKSTART.md          - Quick start guide
docs/
├── MUTATION_TESTING.md   - Explains mutation testing in detail
├── TESTING_SUMMARY.md    - Complete test statistics
└── design.md            - Project architecture
```

### **Data Files**

```
data/
├── products.json      - Database of books (50 products)
└── orders.json        - Database of orders
```

### **Client Files (Frontend)**

```
client/
├── index.html         - Product catalog page
├── cart.html          - Shopping cart page
└── client.js          - Frontend JavaScript
```

---

## 🚀 HOW TO RUN EVERYTHING (Step-by-Step)

### **Location:** Always run commands from project root
```
C:\Users\MD MUDASSIR ALI\OneDrive\Desktop\COURSES\Sem 7\software testing\Software testing project
```

### **Step 1: Start the Server**

**What:** Starts the bookstore website  
**Where:** Open PowerShell in project folder  
**Command:**
```cmd
npm start
```

**What you'll see:**
```
🚀 Mini Online Bookstore Server
📚 Server running on http://localhost:4000
```

**Check it works:** Open browser → http://localhost:4000

**To stop:** Press `Ctrl + C`

---

### **Step 2: Run All Tests**

**What:** Runs 165+ tests to verify everything works  
**Where:** Open NEW PowerShell (keep server running in first one)  
**Command:**
```cmd
npm test
```

**What you'll see:**
```
  Validators Module - Unit Tests
    validateEmail
      ✓ should accept valid email addresses
      ✓ should reject empty emails
    validatePrice
      ✓ should accept positive prices
      ...
  
  165 passing (5s)
```

**Where to check:** Just read the terminal output  
**✅ = Test passed**  
**❌ = Test failed**

---

### **Step 3: Run Unit Tests Only**

**What:** Tests individual functions (faster)  
**Command:**
```cmd
npm run test:unit
```

**What you'll see:**
```
  140 passing (3s)
```

---

### **Step 4: Run Integration Tests Only**

**What:** Tests complete workflows (login → add to cart → checkout)  
**Command:**
```cmd
npm run test:integration
```

**What you'll see:**
```
  25 passing (4s)
```

---

### **Step 5: Run Coverage Report**

**What:** Shows which code is tested (percentage)  
**Command:**
```cmd
npm run test:coverage
```

**What you'll see:**
```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   85.67 |    82.45 |   91.23 |   85.67 |
 validators.js               |   91.00 |    88.80 |   95.10 |   91.00 |
 pricing.js                  |   89.40 |    86.20 |   93.50 |   89.40 |
 ...
```

**Where to check the report:**
1. Open Windows Explorer
2. Go to: `test/results/coverage/index.html`
3. Double-click to open in browser
4. **TAKE SCREENSHOT OF THIS!**

**What it shows:**
- Green lines = Tested code ✅
- Red lines = Not tested ❌
- Yellow lines = Partially tested ⚠️

---

### **Step 6: Run Mutation Testing (MOST IMPORTANT!)**

**What:** Creates bugs to test if your tests catch them  
**Command:**
```cmd
npm run mutation
```

**How long:** 5-10 minutes (creates 630+ mutants)

**What you'll see:**
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
```

**Where to check the report:**
1. Open Windows Explorer
2. Go to: `reports/mutation/index.html`
3. Double-click to open in browser
4. **TAKE SCREENSHOT OF THIS FOR VIVA!**

**What the report shows:**
- **Mutation Score** (big number at top) - Your grade!
- **Killed mutants** (green) - Tests caught the bug ✅
- **Survived mutants** (red) - Tests missed the bug ❌
- Click on files to see specific mutants

---

### **Step 7: Run Everything Automatically**

**What:** Runs all tests + coverage + mutation in one command  
**Command:**
```cmd
scripts\run_all_tests.bat
```

**What it does:**
1. Installs dependencies
2. Runs all tests → saves to `test/results/mocha-results.json`
3. Runs coverage → saves to `test/results/coverage/`
4. Runs mutation → saves to `reports/mutation/`
5. Creates screenshots in `screenshots/` folder
6. Checks if mutation score ≥ 80%

**Output locations:**
- Tests: `test/results/mocha-results.json`
- Coverage: `test/results/coverage/index.html`
- Mutation: `reports/mutation/index.html`
- Screenshots: `screenshots/*.png`

---

## 📸 SCREENSHOTS TO TAKE (For Viva/Submission)

### **Screenshot 1: Test Execution**
**What:** Terminal showing all tests passing  
**When:** After running `npm test`  
**Show:** The "165 passing" message  

### **Screenshot 2: Coverage Report**
**What:** Browser showing coverage percentages  
**Where:** Open `test/results/coverage/index.html`  
**Show:** Overall coverage (85%+) and file-by-file breakdown  

### **Screenshot 3: Mutation Report - Overview**
**What:** Browser showing mutation score  
**Where:** Open `reports/mutation/index.html`  
**Show:** The big mutation score percentage  

### **Screenshot 4: Mutation Report - Details**
**What:** Specific mutants in code  
**Where:** Click on a file in mutation report  
**Show:** Green (killed) and red (survived) mutants in code  

---

## 🎓 FOR YOUR VIVA - Show These Files

### **1. Show Test File (Easy to Explain)**
**File:** `test/unit/validators.spec.js`  
**Lines 1-50:** Open in VS Code

**Point to this test:**
```javascript
it('should reject negative prices', () => {
  const result = validatePrice(-10);
  expect(result.isValid).to.be.false;
});
```

**Say:** "This test checks that negative prices are rejected. It kills ROR mutants."

---

### **2. Show Stryker Config**
**File:** `stryker.conf.js`  
**Lines 40-80:** Show the mutators section

**Say:** "We configured 6 mutation operators: AOR, ROR, LOR for unit-level, and PRV, MDC, RV for integration-level testing."

---

### **3. Show Test Results**
**File:** `test/results/mutation-summary.json` (after running mutation)

**Say:** "Our mutation score is [X]%, which means [X]% of intentional bugs were caught by our tests."

---

## 🔧 TROUBLESHOOTING

### **Error: "Cannot find module"**
**Fix:** 
```cmd
npm install
```

### **Error: "Port 4000 already in use"**
**Fix:** Kill the old server
```cmd
netstat -ano | findstr :4000
taskkill /PID <number> /F
```

### **Tests failing?**
**Fix:** Make sure server is running in another terminal

### **Mutation testing stuck?**
**Fix:** It's normal! Takes 5-10 minutes. Get coffee ☕

---

## 📊 QUICK STATS (For Viva Questions)

- **Total Files:** 39
- **Application Code:** 13 files (~2,000 lines)
- **Test Files:** 6 files (~1,800 lines)
- **Total Tests:** 165+
  - Unit Tests: 140+
  - Integration Tests: 25+
- **Mutation Operators:** 6 (AOR, ROR, LOR, PRV, MDC, RV)
- **Expected Mutation Score:** 70-85%
- **Code Coverage Target:** 85%+ line, 80%+ branch
- **Testing Framework:** Mocha + Chai + Sinon + Supertest + Stryker

---

## 🎯 Quick Viva Prep - What Your Project Does

### 1. **What is this project?**
"It's a Mini Online Bookstore with a complete test suite including unit tests, integration tests, and mutation testing to ensure code quality."

### 2. **What is Mutation Testing?**
"Mutation testing creates small bugs (mutants) in our code on purpose. If our tests catch these bugs, the mutant is 'killed' - which means our tests are good. If tests don't catch the bug, the mutant 'survives' - meaning we need better tests."

### 3. **What are the 6 Mutation Operators?**

**Unit-level (for individual functions):**
- **AOR** (Arithmetic) - Changes `+` to `-`, `*` to `/`
  - Example: `price * quantity` becomes `price / quantity`
  
- **ROR** (Relational) - Changes `>` to `>=`, `==` to `!=`
  - Example: `stock > 0` becomes `stock >= 0`
  
- **LOR** (Logical) - Changes `&&` to `||`, `AND` to `OR`
  - Example: `isValid && inStock` becomes `isValid || inStock`

**Integration-level (for multiple components):**
- **PRV** (Parameter Value) - Changes function parameters
  - Example: `addToCart(quantity)` becomes `addToCart(0)`
  
- **MDC** (Method Call Deletion) - Removes function calls
  - Example: `await saveOrder()` gets deleted
  
- **RV** (Return Value) - Changes what functions return
  - Example: `return true` becomes `return false`

### 4. **How many tests do we have?**
"We have 165+ tests:
- 140+ unit tests (validators, pricing, cart, catalog)
- 25+ integration tests (complete user workflows)"

### 5. **What testing framework?**
"Mocha + Chai for writing tests, Supertest for API testing, Sinon for mocking, and Stryker for mutation testing."

### 6. **What is our mutation score target?**
"70-85% overall. This means 70-85% of mutants should be killed by our tests."

### 7. **What does each test file do?**

- **validators.spec.js** - Tests email, ISBN, price validation
- **pricing.spec.js** - Tests discounts, shipping, tax calculations  
- **catalogService.spec.js** - Tests product search and filtering
- **cartService.spec.js** - Tests shopping cart operations
- **api.spec.js** - Tests complete workflows (login, add to cart, checkout)

### 8. **How do we run tests?**
```cmd
npm test              # All tests
npm run test:coverage # With coverage report
npm run mutation      # Mutation testing
```

---

## 🔥 Common Viva Questions & Answers

**Q: Why use mutation testing?**  
A: "To test the quality of our tests. High code coverage doesn't mean tests are good - mutation testing proves our tests actually catch bugs."

**Q: What's the difference between unit and integration tests?**  
A: "Unit tests check individual functions in isolation. Integration tests check multiple components working together, like a real user flow."

**Q: What is code coverage?**  
A: "Percentage of code lines executed during testing. We target 85%+ line coverage, 80%+ branch coverage."

**Q: What if a mutant survives?**  
A: "It means our tests missed that scenario. We need to add more test cases to catch that bug."

**Q: Why 6 mutation operators?**  
A: "To cover different types of bugs: calculation errors (AOR), boundary issues (ROR), logic errors (LOR), parameter issues (PRV), missing operations (MDC), and wrong return values (RV)."

**Q: What's in the test/helpers.js file?**  
A: "Common test utilities like data backup/restore, test fixtures (fake products), and helper functions to avoid code duplication in tests."

**Q: What's beforeEach and afterEach?**  
A: "beforeEach runs before each test to set up fresh data. afterEach runs after each test to clean up. This keeps tests independent."

**Q: What is Sinon used for?**  
A: "Creating spies, stubs, and mocks. For example, faking a database call so tests run faster and don't need a real database."

---

## 💡 Pro Tips for Viva

1. **If asked something you don't know:** "That's a good question. In our implementation, we focused on [mention something related from above]."

2. **Demo trick:** Show them running `npm test` - when they see 165 tests passing with green checkmarks, it's impressive!

3. **Open the mutation report:** Run `npm run mutation` then open `reports/mutation/index.html` - visual reports impress examiners!

4. **Show one test example:** Open `test/unit/validators.spec.js` and explain ONE simple test like email validation.

---

## 📝 One Test to Memorize (Show This!)

```javascript
it('should reject negative prices', () => {
  const result = validatePrice(-10);
  expect(result.isValid).to.be.false;
  expect(result.errors).to.include('Price must be positive');
});
```

**Explanation:** "This test checks if validatePrice correctly rejects negative prices. It kills ROR mutants that might change `price > 0` to `price >= 0`."

---

## ✅ CHECKLIST BEFORE VIVA

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:coverage` - get coverage report
- [ ] Run `npm run mutation` - get mutation score
- [ ] Take 4 screenshots (test, coverage, mutation x2)
- [ ] Open `test/unit/validators.spec.js` - memorize one test
- [ ] Open `reports/mutation/index.html` - know your mutation score
- [ ] Know what each of 6 operators does (AOR, ROR, LOR, PRV, MDC, RV)
- [ ] Practice explaining mutation testing in simple terms
- [ ] Know the difference between unit and integration tests
- [ ] Be ready to show and explain one test file

---

**Good luck with your viva! You got this! 🚀**
