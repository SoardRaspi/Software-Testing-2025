# Software Testing Project Submission - Final
**Course:** Software Testing (Semester 7)  
**Date:** November 27, 2025  
**Project:** Mutation Testing - Book Store Application

---

## 📦 Submission Contents

### 1. **Source Code** (`src/`)
- **models/**: Product and User models with business logic
- **services/**: CatalogService and InventoryService
- **utils/**: Validators and Pricing utilities
- **server.js**: Express HTTP server (API gateway)
- **app.js**: Business logic orchestration layer

### 2. **Test Suite** (`test/`)

#### **Unit Tests** (`test/unit/`)
- `validators.spec.js` - 109 tests (78.32% mutation score)
- `pricing.spec.js` - 167 tests (86.32% mutation score)
- `inventoryService.spec.js` - 117 tests (64.53% mutation score)
- `catalogService.spec.js` - 115 tests (42.51% mutation score)
- `user.spec.js` - 32 tests (80.00% mutation score)
- `product.spec.js` - 13 tests (94.00% mutation score)
- **Total Unit Tests:** 523 tests

#### **Integration Tests** (`test/integration/`)
- `api.spec.js` - 11 tests (HTTP endpoint integration testing)
- **Total Integration Tests:** 11 tests

#### **Test Utilities** (`test/`)
- `helpers.js` - Test fixtures, data isolation, and utility functions

### 3. **Mutation Testing Reports** (`reports/mutation/`)
- `index.html` - Interactive HTML report (open in browser)
- `mutation-report.json` - Detailed JSON mutation data
- **Final Mutation Score:** 71.35% (682/960 mutants killed)

### 4. **Configuration Files**
- `package.json` - Project dependencies and scripts
- `stryker.conf.js` - Mutation testing configuration
- `package-lock.json` - Dependency lock file

---

## 🎯 Project Achievements

### Mutation Testing Results
- **Initial Score:** 58.02%
- **Final Score:** 71.35%
- **Improvement:** +13.33 percentage points
- **Threshold Met:** ✅ Exceeded 60% requirement by 11.35 points
- **Total Mutants:** 960
- **Mutants Killed:** 682
- **Mutants Survived:** 152
- **No Coverage:** 123

### Test Coverage
- **Total Test Cases:** 534 (all passing)
- **Unit Tests:** 523 tests across 6 files
- **Integration Tests:** 11 tests
- **Test Framework:** Mocha with Assert

---

## 🔬 Mutation Operators Applied

### Unit-Level Mutation Operators
1. **AOR (Arithmetic Operator Replacement)**
   - Mutates: `+`, `-`, `*`, `/`, `%`
   - Tests arithmetic calculations in pricing, stock management

2. **ROR (Relational Operator Replacement)**
   - Mutates: `>`, `<`, `>=`, `<=`, `==`, `!=`
   - Tests boundary conditions in validators and stock checks

3. **LOR (Logical Operator Replacement)**
   - Mutates: `&&`, `||`, boolean literals
   - Tests logical conditions in validation and business rules

### Integration-Level Mutation Operators
1. **PRV (Parameter Replacement/Mutation)**
   - Tests parameter flow across modules
   - Validates data contracts between services

2. **MDC (Method/Function Call Deletion)**
   - Ensures critical side effects execute
   - Tests method invocation chains

3. **RV (Return Value Mutation)**
   - Validates return value contracts
   - Tests response handling across API layers

---

## 📊 Module-wise Mutation Scores

| Module | Mutation Score | Tests | Status |
|--------|---------------|-------|--------|
| Product Model | 94.00% | 13 | ✅ Excellent |
| Pricing Utils | 86.32% | 167 | ✅ Excellent |
| User Model | 80.00% | 32 | ✅ Very Good |
| Validators | 78.32% | 109 | ✅ Very Good |
| Inventory Service | 64.53% | 117 | ✅ Good |
| Catalog Service | 42.51% | 115 | ⚠️ Needs Improvement |

---

## 🚀 How to Run

### Install Dependencies
```bash
npm install
```

### Run Unit Tests
```bash
npm test
```

### Run Mutation Testing
```bash
npm run test:mutation
```

### View Mutation Report
1. Open `reports/mutation/index.html` in a web browser
2. Interactive report shows all mutations, test results, and code coverage

---

## 🧪 Testing Strategy

### Boundary Testing
- Tested min/max values for all numeric inputs
- Edge cases for string lengths and formats
- Zero and negative value handling

### Input Validation
- Comprehensive validator tests covering all validation rules
- Type checking and format validation
- Error message verification

### Business Logic
- Stock management operations (reserve, release, restock)
- Pricing calculations with discounts and taxes
- Catalog operations (search, filter, sort)

### Integration Testing
- Complete API workflow testing
- User authentication flow
- Product catalog integration
- Cross-module data flow validation

---

## 📝 Key Features Tested

### Validators Module (78.32% score)
- Email validation with regex patterns
- ISBN-10 and ISBN-13 checksum validation
- Price validation with min/max constraints
- Address validation with field requirements
- Search query sanitization
- Discount code format validation

### Pricing Module (86.32% score)
- Discount calculations (percentage and fixed)
- Tiered discount system
- Shipping cost calculations with zones and weight
- Tax calculations by state and category
- Bulk discount application
- Loyalty points calculation
- Promotional code validation

### Inventory Service (64.53% score)
- Stock availability checking
- Stock reservation and release
- Product restocking with limits
- Bulk restock operations
- Inventory logging and history
- Low stock alerts
- Inventory value calculations

### Catalog Service (42.51% score)
- Product search with multiple strategies
- Product filtering by multiple criteria
- Product sorting algorithms
- Product updates and validation
- Category-based operations

---

## 🏆 Testing Highlights

1. **Comprehensive Test Suite**: 534 test cases covering all critical paths
2. **High Mutation Kill Rate**: 71.35% of mutants killed
3. **Diverse Mutation Operators**: 9+ different mutation types applied
4. **Boundary Testing**: Extensive edge case coverage
5. **Integration Testing**: Complete API workflow validation
6. **Documentation**: Well-commented tests explaining mutation targets

---

## 📂 Project Structure

```
Software-Testing-Project/
├── src/
│   ├── models/
│   │   ├── product.js
│   │   └── user.js
│   ├── services/
│   │   ├── catalogService.js
│   │   └── inventoryService.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── pricing.js
│   ├── app.js
│   └── server.js
├── test/
│   ├── unit/
│   │   ├── validators.spec.js
│   │   ├── pricing.spec.js
│   │   ├── inventoryService.spec.js
│   │   ├── catalogService.spec.js
│   │   ├── user.spec.js
│   │   └── product.spec.js
│   ├── integration/
│   │   └── api.spec.js
│   └── helpers.js
├── reports/
│   └── mutation/
│       ├── index.html
│       └── mutation-report.json
├── package.json
├── stryker.conf.js
└── SUBMISSION_README.md
```

---

## 🔧 Technologies Used

- **Runtime:** Node.js (ES Modules)
- **Testing Framework:** Mocha
- **Assertion Library:** Node Assert
- **HTTP Testing:** Supertest
- **Mutation Testing:** Stryker 8.7.1
- **Web Framework:** Express.js

---

## 📌 Important Notes

1. **All tests are passing** - 534/534 tests pass successfully
2. **Mutation threshold exceeded** - 71.35% > 60% requirement
3. **No breaking changes** - All existing functionality preserved
4. **Well-documented** - Each test explains which mutations it targets
5. **Production-ready** - Code follows best practices and patterns

---

## 🎓 Learning Outcomes

1. Understanding mutation testing principles and benefits
2. Writing effective test cases that catch real bugs
3. Identifying weak spots in test coverage
4. Boundary value analysis and edge case testing
5. Integration testing strategies
6. Code quality metrics and improvement techniques

---

## ✅ Submission Checklist

- [x] Source code with all modules
- [x] Complete test suite (534 tests)
- [x] Mutation testing configuration
- [x] HTML mutation report
- [x] JSON mutation data
- [x] Package dependencies
- [x] Documentation
- [x] Achieved >60% mutation score (71.35%)
- [x] All tests passing

---

**Thank you for reviewing this submission!**
