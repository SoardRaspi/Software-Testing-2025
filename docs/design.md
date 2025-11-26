# Design Document - Mini Online Bookstore

## Architecture Overview

This document explains the design decisions and testing considerations for the Mini Online Bookstore project.

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│     Client Layer (HTML/CSS/JS)      │
│  - index.html (catalog)             │
│  - cart.html (shopping cart)        │
│  - client.js (API wrapper)          │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│     Server Layer (Express)          │
│  - server.js (routes, middleware)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Layer (app.js)        │
│  - Session management               │
│  - High-level orchestration         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Service Layer                   │
│  - catalogService.js                │
│  - cartService.js                   │
│  - inventoryService.js              │
│  - orderService.js                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Utility Layer                   │
│  - validators.js                    │
│  - pricing.js                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Model Layer                     │
│  - product.js                       │
│  - cart.js                          │
│  - order.js                         │
│  - user.js                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer (JSON files)           │
│  - products.json                    │
│  - orders.json                      │
└─────────────────────────────────────┘
```

## Design Patterns Used

### 1. Service Layer Pattern
- Separates business logic from data access
- Services: `catalogService`, `cartService`, `inventoryService`, `orderService`
- Benefits: Testability, reusability, separation of concerns

### 2. Repository Pattern (Simplified)
- JSON file-based persistence
- `loadProducts()`, `saveProducts()`, `loadOrders()`, `saveOrders()`
- Easy to mock for testing

### 3. Domain Model Pattern
- Rich domain objects: `Product`, `Cart`, `Order`, `User`
- Encapsulate business logic within models
- Methods like `isLowStock()`, `calculateTotals()`, `canBeCancelled()`

### 4. Facade Pattern
- `app.js` provides simplified interface to complex subsystems
- Hides service orchestration complexity from server routes

## Mutation Testing Considerations

### High Mutation Score Targets

#### 1. Validators Module (validators.js)
**Lines of Code**: ~350

**Key Functions for Mutation Testing**:

```javascript
validateEmail(email)
```
- **Mutation Targets**: 8 nested conditions
- **Operators**: Relational (<, >, ===), logical (&&, ||)
- **Expected Mutants**: ~25-30
- **Test Strategy**: Test each validation level independently
  - Empty string
  - Missing @
  - Multiple @
  - Invalid domain format
  - Special characters
  - Length boundaries

```javascript
validateISBN(isbn)
```
- **Mutation Targets**: Checksum algorithms, digit validation
- **Operators**: Arithmetic (*, +, %), conditionals
- **Expected Mutants**: ~20-25
- **Test Strategy**: 
  - Valid ISBN-10 and ISBN-13
  - Invalid checksums
  - Wrong length
  - Non-digit characters

```javascript
validatePrice(price, options)
```
- **Mutation Targets**: Boundary conditions, range checks
- **Operators**: Relational (>, <, >=, <=)
- **Expected Mutants**: ~15-20
- **Test Strategy**:
  - Boundary values (0, min, max)
  - Negative values
  - Very large values
  - Decimal precision

#### 2. Pricing Module (pricing.js)
**Lines of Code**: ~400

**Key Functions for Mutation Testing**:

```javascript
getDiscountTier(subtotal)
```
- **Mutation Targets**: 5-tier nested if-else chain
- **Operators**: Relational (>=), arithmetic (*)
- **Expected Mutants**: ~15-20
- **Test Strategy**:
  - Test each tier boundary
  - Values just below threshold
  - Values at threshold
  - Values above threshold

```javascript
calculateShipping(items, address, options)
```
- **Mutation Targets**: Zone logic, weight tiers, free shipping
- **Operators**: Conditionals, arithmetic, logical
- **Expected Mutants**: ~25-30
- **Test Strategy**:
  - Different zones (local, national, international)
  - Weight boundaries (0-5, 5-10, 10-20, 20+)
  - Free shipping threshold
  - Express vs standard shipping

```javascript
calculateTax(subtotal, state, items)
```
- **Mutation Targets**: State-specific rates, category exemptions
- **Operators**: Conditionals, multiplication
- **Expected Mutants**: ~20-25
- **Test Strategy**:
  - Different states (CA, NY, TX, OR)
  - Tax-exempt categories
  - Combined taxable and non-taxable items

```javascript
applyBulkDiscount(items)
```
- **Mutation Targets**: 6 quantity tiers
- **Operators**: Relational, arithmetic
- **Expected Mutants**: ~18-22
- **Test Strategy**:
  - Each quantity tier (5, 10, 20, 50, 100, 200)
  - Mixed quantities per item
  - No discounts applicable

#### 3. Cart Model (cart.js)
**Lines of Code**: ~200

**Key Functions**:

```javascript
addItem(product, quantity)
```
- **Mutation Targets**: Duplicate detection, quantity addition
- **Operators**: Conditionals, arithmetic (+, +=)
- **Expected Mutants**: ~12-15
- **Test Strategy**:
  - Add new item
  - Add existing item (quantity increases)
  - Invalid product
  - Zero quantity

```javascript
qualifiesForFreeShipping(threshold)
```
- **Mutation Targets**: Nested subtotal/weight checks
- **Operators**: Relational (>=), logical (||)
- **Expected Mutants**: ~8-10
- **Test Strategy**:
  - Below threshold
  - At threshold
  - Above threshold
  - Heavy items exception

#### 4. Order Model (order.js)
**Lines of Code**: ~240

**Key Functions**:

```javascript
updateStatus(newStatus)
```
- **Mutation Targets**: State transition validation
- **Operators**: Array operations, conditionals
- **Expected Mutants**: ~15-18
- **Test Strategy**:
  - Valid transitions (pending → confirmed → shipped → delivered)
  - Invalid transitions (shipped → pending)
  - Cancel from different states

```javascript
canBeCancelled()
```
- **Mutation Targets**: Time-based and status-based logic
- **Operators**: Date comparison, logical operators
- **Expected Mutants**: ~10-12
- **Test Strategy**:
  - Within cancellation window
  - After window expires
  - Already shipped
  - Different statuses

### Integration Testing Targets

#### 1. Cart → Order Flow
**Test Scenario**: Complete checkout process
- Add items to cart
- Apply discounts
- Validate stock
- Reserve inventory
- Create order
- Process payment
- Update stock levels

**Mutation Opportunities**:
- Stock validation logic
- Rollback on failure
- Order total calculations
- Status transitions

#### 2. Inventory Management
**Test Scenario**: Stock operations
- Reserve stock
- Release stock on order cancellation
- Restock products
- Handle concurrent reservations

**Mutation Opportunities**:
- Atomic operations
- Negative stock prevention
- Transaction logging

#### 3. Search and Filter
**Test Scenario**: Product discovery
- Text search across fields
- Category filtering
- Price range filtering
- Sorting by multiple criteria

**Mutation Opportunities**:
- String matching logic
- Range comparisons
- Sort comparisons
- Pagination calculations

## Parameter Coupling Examples

### Explicit Coupling

```javascript
// searchProducts - 4 parameters interact
searchProducts(query, category, minPrice, maxPrice)
// Mutation targets: Filter combinations
```

```javascript
// calculateDiscount - Multiple parameter interactions
calculateDiscount(amount, type, customerTier, isFirstOrder, promoCode)
// Mutation targets: Conditional branches based on combinations
```

```javascript
// createOrder - Complex parameter relationships
createOrder(userId, cartItems, shippingAddress, paymentMethod, giftOptions)
// Mutation targets: Validation across all parameters
```

### Implicit Coupling

```javascript
// Cart total calculation depends on:
// - Item prices
// - Quantities
// - Discount tier (based on subtotal)
// - Shipping rules (based on weight/location)
// - Tax rate (based on location/categories)
```

## Symbolic Testing Opportunities

### Path Coverage

**Example: validateEmail()**

Possible paths:
1. Empty string → false
2. No @ symbol → false
3. Multiple @ → false
4. No dot after @ → false
5. Invalid domain → false
6. Too short local part → false
7. Too short domain → false
8. Special characters → false
9. All validations pass → true

**Symbolic Variables**:
- `len` = email.length
- `atCount` = number of @ symbols
- `dotAfterAt` = position of dot after @
- `localLen` = length before @
- `domainLen` = length after @

**Path Constraints**:
- Path 1: `len === 0`
- Path 2: `atCount === 0`
- Path 3: `atCount > 1`
- Path 4: `dotAfterAt === -1`
- Path 9: `len > 0 && atCount === 1 && dotAfterAt > 0 && localLen >= 1 && domainLen >= 2`

### Boundary Value Analysis

**Example: getDiscountTier(subtotal)**

Boundaries:
- `subtotal < 50` → 0% (tier 0)
- `50 <= subtotal < 100` → 5% (tier 1)
- `100 <= subtotal < 200` → 10% (tier 2)
- `200 <= subtotal < 500` → 15% (tier 3)
- `500 <= subtotal < 1000` → 20% (tier 4)
- `subtotal >= 1000` → 25% (tier 5)

**Test Values**:
- Below: `49.99`
- At boundary: `50.00`
- Above: `50.01`
- Repeat for each tier

## Code Coverage Goals

### Unit Test Coverage
- **Validators**: 95%+ line coverage, 90%+ branch coverage
- **Pricing**: 90%+ line coverage, 85%+ branch coverage
- **Models**: 85%+ line coverage, 80%+ branch coverage
- **Services**: 75%+ line coverage, 70%+ branch coverage

### Mutation Coverage
- **Overall Target**: 70-85%
- **Critical Paths** (checkout, payment): 80%+
- **Utility Functions**: 85%+
- **UI Layer**: 50%+ (lower priority)

## Testing Strategy

### 1. Unit Testing (Bottom-Up)
**Priority Order**:
1. Validators (most mutations expected)
2. Pricing calculations (complex logic)
3. Model methods (domain logic)
4. Service functions (business logic)

### 2. Integration Testing
**Key Flows**:
1. Browse → Add to Cart → Checkout → Order
2. Search → Filter → Sort → Select
3. Inventory Reserve → Create Order → Release on Cancel

### 3. Mutation Testing
**Stryker Configuration**:
```json
{
  "mutate": [
    "src/utils/**/*.js",    // High priority
    "src/models/**/*.js",   // Medium-high priority
    "src/services/**/*.js"  // Medium priority
  ],
  "mutator": {
    "excludedMutations": [
      "StringLiteral",  // Less valuable
      "LogicalOperator" // Optional: can be very noisy
    ]
  }
}
```

### 4. Symbolic Testing
**Tools**: Can be done manually or with tools like:
- Jest with code coverage
- Custom path enumeration scripts

**Approach**:
1. Identify functions with multiple branches
2. List all possible paths
3. Derive path constraints
4. Generate test cases satisfying each path

## Metrics and Goals

### Lines of Code
- **Models**: ~690 lines
- **Utils**: ~750 lines
- **Services**: ~1,420 lines
- **App/Server**: ~500 lines
- **Client**: ~640 lines
- **Total**: ~4,000 lines

### Complexity Metrics (Estimated)
- **Cyclomatic Complexity**:
  - `validateEmail`: 9
  - `getDiscountTier`: 6
  - `calculateShipping`: 12
  - `searchProducts`: 15

### Mutation Score Targets
- **Validators**: 85%
- **Pricing**: 80%
- **Models**: 75%
- **Services**: 70%
- **Overall**: 75%

## Anti-Patterns to Avoid in Tests

1. **Fragile Tests**: Don't test implementation details
2. **Over-Mocking**: Mock only external dependencies
3. **Insufficient Edge Cases**: Test boundaries thoroughly
4. **Ignoring Error Paths**: Test failure scenarios
5. **Copy-Paste Tests**: Parameterize similar tests

## Recommended Test Structure

```javascript
describe('validateEmail', () => {
  describe('empty inputs', () => {
    it('should reject empty string');
    it('should reject null');
    it('should reject undefined');
  });

  describe('@ symbol validation', () => {
    it('should reject missing @');
    it('should reject multiple @');
  });

  describe('domain validation', () => {
    it('should reject missing domain');
    it('should reject invalid TLD');
  });

  describe('valid emails', () => {
    it('should accept standard email');
    it('should accept email with + sign');
    it('should accept email with dots');
  });
});
```

## Conclusion

This project provides a rich environment for:
- **Mutation Testing**: Abundant conditional logic and calculations
- **Symbolic Testing**: Clear path conditions and constraints
- **Integration Testing**: Multi-layer interactions
- **Unit Testing**: Well-isolated components

The architecture supports comprehensive testing at all levels while maintaining clean separation of concerns.

---

**For testing implementation details, see README.md**
