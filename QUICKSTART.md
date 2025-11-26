# Quick Start Guide

## Project Complete! ✅

Your Mini Online Bookstore is ready for mutation testing.

## 📊 Project Statistics

- **Total Files**: 20
- **Lines of Code**: ~4,000+
- **Models**: 4 classes
- **Services**: 4 modules
- **Utilities**: 2 modules
- **API Endpoints**: 15+
- **Client Pages**: 2 HTML pages

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Express 4.18.2 (web framework)
- Stryker Mutator 8.0.0 (mutation testing)

### 2. Start the Server

```bash
npm start
```

The server will start on http://localhost:3000

### 3. Open in Browser

- **Catalog**: http://localhost:3000/index.html
- **Cart**: http://localhost:3000/cart.html

## 📁 Project Files Overview

### Backend (JavaScript/Node.js)
```
src/
├── models/
│   ├── product.js      (160 lines) - Product entity with stock management
│   ├── cart.js         (200 lines) - Shopping cart with calculations
│   ├── order.js        (240 lines) - Order with status management
│   └── user.js         (90 lines)  - User account representation
│
├── utils/
│   ├── validators.js   (350 lines) - Complex validation functions
│   └── pricing.js      (400 lines) - Pricing logic with discounts
│
├── services/
│   ├── catalogService.js    (380 lines) - Product catalog operations
│   ├── cartService.js       (340 lines) - Cart management
│   ├── inventoryService.js  (320 lines) - Stock management
│   └── orderService.js      (380 lines) - Order processing
│
├── app.js              (270 lines) - Application orchestrator
└── server.js           (230 lines) - Express REST API server
```

### Frontend (HTML/CSS/JavaScript)
```
client/
├── index.html          (360 lines) - Product catalog page
├── cart.html           (380 lines) - Shopping cart page
└── client.js           (320 lines) - API wrapper functions
```

### Data
```
data/
├── products.json       - 20 books with realistic data
└── orders.json         - Order storage (starts empty)
```

### Documentation
```
docs/
└── design.md           - Architecture and testing strategy

README.md               - Full project documentation
```

## 🧪 For Your Mutation Testing Assignment

### High-Value Testing Targets

1. **validators.js** (350 lines)
   - `validateEmail()` - 8 nested conditions
   - `validateISBN()` - Checksum algorithms
   - `validatePrice()` - Boundary conditions
   - Expected: 80-90% mutation score

2. **pricing.js** (400 lines)
   - `getDiscountTier()` - 5-tier logic
   - `calculateShipping()` - Complex zones/weights
   - `calculateTax()` - State-specific rates
   - `applyBulkDiscount()` - 6 quantity tiers
   - Expected: 75-85% mutation score

3. **cart.js** (200 lines)
   - `addItem()` - Duplicate handling
   - `qualifiesForFreeShipping()` - Nested checks
   - Expected: 75-80% mutation score

4. **order.js** (240 lines)
   - `updateStatus()` - State transitions
   - `canBeCancelled()` - Time/status logic
   - Expected: 70-80% mutation score

### Integration Test Scenarios

1. **Complete Purchase Flow**
   - Browse catalog → Add to cart → Apply discount → Checkout → Create order
   - Tests: Stock validation, price calculations, order creation

2. **Inventory Management**
   - Reserve stock → Create order → Cancel order → Release stock
   - Tests: Atomic operations, rollback logic

3. **Search and Filter**
   - Search by text → Filter by category → Filter by price → Sort
   - Tests: Multi-criteria filtering, pagination

## 🎯 Mutation Testing Setup

### Step 1: Install Stryker (if needed)

Already included in package.json devDependencies.

### Step 2: Create Stryker Config

Create `stryker.conf.json` in project root:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "command",
  "testRunnerCommand": "npm test",
  "coverageAnalysis": "off",
  "mutate": [
    "src/models/**/*.js",
    "src/utils/**/*.js",
    "src/services/**/*.js",
    "!src/**/*.spec.js"
  ],
  "timeoutMS": 30000,
  "concurrency": 4
}
```

### Step 3: Write Unit Tests

Create test files (example structure):

```
tests/
├── utils/
│   ├── validators.test.js
│   └── pricing.test.js
├── models/
│   ├── cart.test.js
│   └── order.test.js
└── services/
    └── cartService.test.js
```

### Step 4: Run Mutation Tests

```bash
npm run mutation
```

or

```bash
npx stryker run
```

## 💡 Testing Tips

### For Unit Tests

Focus on these functions first:

```javascript
// validators.js
validateEmail(email)           // 8 branches
validateISBN(isbn)             // checksum validation
validatePrice(price, options)  // boundary checks

// pricing.js
getDiscountTier(subtotal)      // 5-tier logic
calculateShipping(items, ...)  // zone/weight logic
applyBulkDiscount(items)       // 6 quantity tiers

// cart.js
addItem(product, quantity)     // duplicate handling
calculateTotals()              // price summation

// order.js
updateStatus(newStatus)        // state transitions
canBeCancelled()               // time/status checks
```

### Test Data Examples

```javascript
// Valid email tests
'user@example.com'
'test.user+tag@domain.co.uk'

// Invalid email tests
''
'invalid'
'@example.com'
'user@@example.com'
'user@'

// Price boundary tests
0, 0.01, 49.99, 50.00, 50.01

// ISBN tests
'0-306-40615-2'    // valid ISBN-10
'978-3-16-148410-0' // valid ISBN-13
'123456789'        // invalid
```

## 📈 Expected Results

### Mutation Score Goals

- **Overall**: 70-85%
- **Validators**: 80-90%
- **Pricing**: 75-85%
- **Models**: 75-80%
- **Services**: 65-75%

### Code Coverage Goals

- **Line Coverage**: 85%+
- **Branch Coverage**: 80%+
- **Function Coverage**: 90%+

## 🐛 Troubleshooting

### Server won't start
```bash
# Check Node version (requires 18+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Port 3000 already in use
Change port in `src/server.js` line 11:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

### Cannot find module errors
Make sure `"type": "module"` is in package.json

## 📚 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start server: `npm start`
3. ✅ Test in browser: http://localhost:3000
4. ⏳ Write unit tests for validators
5. ⏳ Write unit tests for pricing
6. ⏳ Configure Stryker
7. ⏳ Run mutation tests
8. ⏳ Analyze results
9. ⏳ Improve tests to kill more mutants

## 📖 Documentation

- **README.md** - Full project documentation
- **docs/design.md** - Architecture and testing strategy details
- **package.json** - Dependencies and scripts

## 🎓 For Your Report

This project demonstrates:

✅ **Rich Control Flow** - Nested conditionals throughout
✅ **Parameter Coupling** - Functions with interacting parameters  
✅ **Boundary Conditions** - Extensive edge case handling
✅ **Complex Logic** - Multi-tier calculations
✅ **Integration Points** - Service orchestration
✅ **Production Quality** - Well-structured, documented code

Perfect for demonstrating mutation testing concepts!

---

**Happy Testing! 🧪**

Need help? Check README.md or design.md for detailed information.
