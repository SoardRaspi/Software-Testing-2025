# Mini Online Bookstore

A complete JavaScript/Node.js application designed for mutation testing and software testing coursework.

## 📋 Project Overview

This is a medium-sized web application (~3,000+ lines of code) that simulates an online bookstore with features including:

- Product catalog with search and filtering
- Shopping cart management
- Order checkout and processing
- Inventory management
- User session handling
- Complex pricing calculations

## 🎯 Purpose

This project is specifically designed for **mutation testing** using Stryker Mutator. The codebase includes:

- Rich control flow with nested conditionals
- Complex branching logic
- Parameter coupling
- Multiple integration points
- Edge case handling
- Extensive validation logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm start
```

The application will be available at:
- **Main Page**: http://localhost:3000
- **Catalog**: http://localhost:3000/index.html
- **Cart**: http://localhost:3000/cart.html

### Development Mode

Run with auto-reload on file changes:

```bash
npm run dev
```

## 🧪 Testing

### Test Suite Overview

The project includes **40+ unit tests** and **10+ integration tests** using Mocha + Chai.

### Running Tests

**All Tests**:
```bash
npm test
```

**Unit Tests Only**:
```bash
npm run test:unit
```

**Integration Tests Only**:
```bash
npm run test:integration
```

**Code Coverage**:
```bash
npm run test:coverage
```
Opens HTML report showing line, branch, and function coverage.

### Mutation Testing

Run Stryker mutation testing:

```bash
npm run mutation
```

This will:
1. Generate mutants of your code using 6 mutation operators
2. Run tests against each mutant
3. Generate a mutation score report
4. Create an HTML report in `reports/mutation/index.html`

**View Report**:
```bash
npm run mutation:report
```

### Mutation Operators

#### Unit-Level Operators:
1. **AOR** (Arithmetic Operator Replacement): Tests calculation correctness
2. **ROR** (Relational Operator Replacement): Tests boundary conditions
3. **LOR** (Logical Operator Replacement): Tests boolean logic

#### Integration-Level Operators:
4. **PRV** (Parameter Replacement): Tests parameter validation across modules
5. **MDC** (Method Call Deletion): Tests side effects execution
6. **RV** (Return Value Mutation): Tests return value contracts

See `docs/MUTATION_TESTING.md` for detailed explanations and examples.

### Test Coverage Goals

- **Line Coverage**: 85%+
- **Branch Coverage**: 80%+
- **Function Coverage**: 90%+
- **Mutation Score**: 70-85%

### Test Files

```
test/
├── unit/
│   ├── validators.spec.js      - 40+ assertions
│   ├── pricing.spec.js         - 45+ assertions
│   ├── catalogService.spec.js  - 30+ assertions
│   └── cartService.spec.js     - 35+ assertions
├── integration/
│   └── api.spec.js             - 25+ integration tests
└── helpers.js                  - Test utilities
```

## 📁 Project Structure

```
project/
├── src/
│   ├── models/           # Data models (Product, Cart, Order, User)
│   ├── utils/            # Utility functions (validators, pricing)
│   ├── services/         # Business logic services
│   ├── app.js            # Application orchestrator
│   └── server.js         # Express server
├── client/               # Frontend HTML/CSS/JS
│   ├── index.html        # Product catalog page
│   ├── cart.html         # Shopping cart page
│   └── client.js         # Client-side API wrapper
├── data/                 # JSON data files
│   ├── products.json     # Product catalog
│   └── orders.json       # Order history
├── docs/                 # Documentation
└── package.json          # Project configuration
```

## 🔑 Key Features

### Product Catalog
- Browse 20+ books across multiple categories
- Search by title, author, or ISBN
- Filter by category and price range
- Sort by title, price, or stock level
- Pagination support

### Shopping Cart
- Add/remove/update quantities
- Real-time stock validation
- Automatic discount calculation
- Bulk discount tiers
- Free shipping thresholds

### Order Processing
- Multi-field address validation
- Multiple payment methods
- Stock reservation with rollback
- Order status tracking
- Cancellation rules

### Inventory Management
- Stock level tracking
- Low stock alerts
- Restock operations
- Transaction history
- Inventory value calculation

## 🎨 API Endpoints

### Authentication
- `POST /api/auth/login` - Create user session
- `POST /api/auth/logout` - End session

### Catalog
- `GET /api/catalog` - Get products (with filters)
- `GET /api/catalog/:id` - Get product details
- `GET /api/featured` - Get featured products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item
- `PUT /api/cart/update` - Update quantity

### Orders
- `POST /api/orders/checkout` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Admin
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Health check

## 🧬 Mutation Testing Targets

The codebase includes numerous targets for mutation testing:

### High-Value Functions for Mutation Testing

**Validators (src/utils/validators.js)**
- `validateEmail()` - 8-level nested validation
- `validateISBN()` - Checksum algorithms
- `validatePrice()` - Boundary conditions
- `validateQuantity()` - Integer enforcement
- `validateAddress()` - Multi-field validation

**Pricing Logic (src/utils/pricing.js)**
- `calculateDiscount()` - Type-based branching
- `getDiscountTier()` - 5-tier nested conditions
- `calculateShipping()` - Zone/weight logic
- `calculateTax()` - State-specific rates
- `applyBulkDiscount()` - Quantity break points
- `calculateLoyaltyPoints()` - Multiplier logic

**Business Logic**
- Cart operations with stock validation
- Order creation with rollback logic
- Inventory management with transactions
- Search and filter with multiple criteria

### Parameter Coupling Examples
- `searchProducts(query, category, minPrice, maxPrice)`
- `calculateDiscount(amount, type, customerTier, ...)`
- `createOrder(userId, cart, address, payment, ...)`

## 📊 Expected Mutation Score

With comprehensive test coverage, you should aim for:
- **Overall**: 70-85%
- **Validators**: 80-90% (high branch coverage)
- **Pricing**: 75-85% (complex math)
- **Services**: 65-75% (integration logic)

## 🔧 Configuration

### Stryker Configuration

Create `stryker.conf.json`:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "mocha",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.js",
    "!src/**/*.spec.js",
    "!src/server.js"
  ]
}
```

## 💡 Tips for Testing

1. **Unit Tests**: Focus on validators and pricing functions first
2. **Integration Tests**: Test cart → order workflow
3. **Edge Cases**: Test boundary conditions (stock=0, price=0, etc.)
4. **Error Paths**: Test validation failures
5. **State Changes**: Test order status transitions

## 🐛 Known Limitations

- In-memory session storage (resets on server restart)
- JSON file storage (not suitable for production)
- No authentication/authorization (simulated only)
- No database (intentionally simplified)

## 📝 Assignment Notes

This codebase provides:
- ✅ 3,000+ lines of production-quality code
- ✅ Rich control flow for mutation testing
- ✅ Multiple modules for unit testing
- ✅ Integration points for end-to-end testing
- ✅ Well-commented, readable code
- ✅ RESTful API design
- ✅ Separation of concerns

## 📚 Further Reading

- [Stryker Mutator Documentation](https://stryker-mutator.io)
- [Mutation Testing Concepts](https://en.wikipedia.org/wiki/Mutation_testing)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 👨‍💻 Development

### Adding More Products

Use the generateLargeProducts.js script (to be implemented):

```bash
node scripts/generateLargeProducts.js 50
```

### Modifying Business Logic

Key files to edit:
- `src/utils/validators.js` - Input validation rules
- `src/utils/pricing.js` - Pricing calculations
- `src/services/` - Business logic

## 📄 License

This is an educational project for software testing coursework.

## 🙋 Support

For questions about the project structure or testing approach, refer to `docs/design.md`.

---

**Happy Testing! 🧪**
