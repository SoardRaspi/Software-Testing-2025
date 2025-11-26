# Mutation Testing Guide

## Overview

This project implements comprehensive mutation testing using Stryker Mutator to validate test suite quality.

## Mutation Operators

### Unit-Level Operators

#### 1. AOR - Arithmetic Operator Replacement
**What it does**: Replaces arithmetic operators (`+`, `-`, `*`, `/`, `%`)

**Example**:
```javascript
// Original code
const total = price * quantity;

// Mutant
const total = price / quantity;
```

**Killed by**: Tests that verify correct calculations
```javascript
it('should calculate total correctly', () => {
  expect(calculateTotal(10, 3)).to.equal(30); // Kills mutant: 10 / 3 ≠ 30
});
```

**Where applied**:
- `pricing.js`: Discount calculations, tax calculations
- `cart.js`: Subtotal and total calculations
- `validators.js`: Length calculations

#### 2. ROR - Relational Operator Replacement
**What it does**: Replaces relational operators (`>`, `<`, `>=`, `<=`, `==`, `!=`)

**Example**:
```javascript
// Original code
if (stock > 0) { /* available */ }

// Mutant
if (stock >= 0) { /* available */ }
```

**Killed by**: Boundary condition tests
```javascript
it('should reject zero stock', () => {
  expect(isAvailable(0)).to.be.false; // Kills mutant: 0 >= 0 is true
});
```

**Where applied**:
- `validators.js`: Price and quantity validation
- `pricing.js`: Discount tier boundaries
- `catalogService.js`: Filter comparisons
- `cartService.js`: Stock validation

#### 3. LOR - Logical Operator Replacement
**What it does**: Replaces logical operators (`&&`, `||`) and negates booleans (`!`)

**Example**:
```javascript
// Original code
if (isValid && isAvailable) { /* proceed */ }

// Mutant
if (isValid || isAvailable) { /* proceed */ }
```

**Killed by**: Tests covering all logical paths
```javascript
it('should require both conditions', () => {
  expect(canProceed(true, false)).to.be.false; // Kills OR mutant
  expect(canProceed(false, true)).to.be.false; // Kills OR mutant
  expect(canProceed(true, true)).to.be.true;   // Both required
});
```

**Where applied**:
- `validators.js`: Multi-condition validation
- `pricing.js`: Eligibility checks
- `cartService.js`: Combined validations

### Integration-Level Operators

#### 4. PRV - Parameter Replacement/Mutation
**What it does**: Changes parameter values in function calls

**Example**:
```javascript
// Original code
const result = service.validateStock(productId, quantity);

// Mutant
const result = service.validateStock(productId, 0);
```

**Killed by**: Integration tests validating parameter flow
```javascript
it('should reject adding more than available stock', async () => {
  const response = await request(app)
    .post('/api/cart/add')
    .send({ productId: 'test-001', quantity: 999 });
  
  expect(response.status).to.equal(400); // Kills mutant: quantity=0 would pass
});
```

**Where applied**:
- Service-to-service calls
- Controller-to-service calls
- Cross-module parameter passing

#### 5. MDC - Method/Function Call Deletion
**What it does**: Removes function calls (side effects)

**Example**:
```javascript
// Original code
logger.log('Order created');
await saveToDatabase(order);
return order;

// Mutant
// logger.log('Order created'); <- deleted
// await saveToDatabase(order); <- deleted
return order;
```

**Killed by**: Tests verifying side effects
```javascript
it('should persist order to database', async () => {
  await createOrder(orderData);
  
  const orders = await loadOrders(); // Verify save happened
  expect(orders.length).to.be.above(0); // Kills mutant: deletion would fail this
});
```

**Where applied**:
- Database operations (`saveProducts`, `saveOrders`)
- Stock reservations in checkout
- Cart clearing after checkout
- Inventory updates

#### 6. RV - Return Value Mutation
**What it does**: Mutates return values (`true` ↔ `false`, numbers, objects)

**Example**:
```javascript
// Original code
return { success: true, data: result };

// Mutant
return { success: false, data: result };
```

**Killed by**: Tests validating return values
```javascript
it('should return success status', async () => {
  const result = await addToCart(productId, quantity);
  
  expect(result.success).to.be.true; // Kills false mutant
  expect(result.data).to.exist;      // Kills null mutant
});
```

**Where applied**:
- Service method returns
- Validation function returns
- API response contracts

## Running Mutation Tests

### Basic Run
```bash
npm run mutation
```

### With HTML Report
```bash
npm run mutation:report
```

### Configuration
Edit `stryker.conf.js` to customize:
- Files to mutate
- Mutation operators
- Concurrency
- Thresholds

## Interpreting Results

### Mutation Score
```
Mutation Score = (Killed Mutants / Total Mutants) × 100
```

### Status Types
- **Killed**: Mutant detected by tests ✅
- **Survived**: Mutant not detected ⚠️
- **No Coverage**: Code not executed ❌
- **Timeout**: Test took too long ⏱️
- **Error**: Mutant caused compile error 🐛

### Target Scores
- **Validators**: 80-90% (high complexity)
- **Pricing**: 75-85% (calculations)
- **Models**: 75-80% (business logic)
- **Services**: 65-75% (integration)
- **Overall**: 70-85%

## Example Mutants and Killer Tests

### Example 1: Discount Tier Boundary
```javascript
// Original: pricing.js
function getDiscountTier(subtotal) {
  if (subtotal >= 50) return 0.05;
  return 0;
}

// Mutant: >= changed to >
function getDiscountTier(subtotal) {
  if (subtotal > 50) return 0.05;  // ROR mutant
  return 0;
}

// Killer test
it('should apply discount at exact threshold', () => {
  expect(getDiscountTier(50.00)).to.equal(0.05); // ✅ Kills ROR mutant
  expect(getDiscountTier(49.99)).to.equal(0);
});
```

### Example 2: Cart Total Calculation
```javascript
// Original: cart.js
calculateSubtotal() {
  return this.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0);
}

// Mutant: + changed to -
calculateSubtotal() {
  return this.items.reduce((sum, item) => 
    sum - (item.price * item.quantity), 0);  // AOR mutant
}

// Killer test
it('should sum item totals', () => {
  cart.addItem({ price: 10, quantity: 2 });
  cart.addItem({ price: 5, quantity: 3 });
  
  expect(cart.calculateSubtotal()).to.equal(35); // ✅ Kills AOR mutant
  // Mutant would give: 0 - 20 - 15 = -35
});
```

### Example 3: Stock Validation Integration
```javascript
// Original: cartService.js
async function addToCart(cart, productId, quantity) {
  const product = await catalogService.getProduct(productId);
  
  if (product.stock < quantity) {  // ROR boundary
    return { success: false, message: 'Insufficient stock' };
  }
  
  cart.addItem(product, quantity);  // MDC - could be deleted
  return { success: true };
}

// Killer integration test
it('should reject adding more than available stock', async () => {
  // Product has stock = 5
  const result = await addToCart(cart, 'test-product', 10);
  
  expect(result.success).to.be.false;        // ✅ Kills RV mutant
  expect(result.message).to.include('stock'); // ✅ Validates message
  expect(cart.items).to.be.empty;            // ✅ Kills MDC mutant
});
```

## Improving Mutation Score

### 1. Add Boundary Tests
```javascript
// Instead of just testing valid cases
it('should accept valid quantity', () => {
  expect(validate(5)).to.be.true;
});

// Add boundary cases
it('should test exact boundaries', () => {
  expect(validate(0)).to.be.false;   // Boundary
  expect(validate(1)).to.be.true;    // Just above
  expect(validate(100)).to.be.true;  // Max
  expect(validate(101)).to.be.false; // Just above max
});
```

### 2. Test Both Paths
```javascript
// Test both true and false paths
it('should handle valid and invalid cases', () => {
  expect(isEligible(valid)).to.be.true;
  expect(isEligible(invalid)).to.be.false;
});
```

### 3. Verify Side Effects
```javascript
it('should actually save data', async () => {
  await service.save(data);
  
  // Verify save happened
  const loaded = await service.load();
  expect(loaded).to.deep.equal(data);
});
```

### 4. Test Return Values
```javascript
it('should return correct structure', () => {
  const result = service.process(input);
  
  expect(result.success).to.exist;
  expect(result.data).to.exist;
  expect(result.success).to.be.true; // Test actual value
});
```

## Common Pitfalls

### ❌ Testing Implementation
```javascript
// Bad - tests internal implementation
it('should call helper function', () => {
  const spy = sinon.spy(helper, 'validate');
  service.process(data);
  expect(spy.called).to.be.true;
});
```

### ✅ Testing Behavior
```javascript
// Good - tests external behavior
it('should reject invalid data', () => {
  const result = service.process(invalidData);
  expect(result.success).to.be.false;
});
```

## Best Practices

1. **Test all branches**: Ensure every `if`, `else`, `switch` is tested
2. **Test boundaries**: Test values at, just below, and just above thresholds
3. **Test error paths**: Don't just test happy paths
4. **Verify side effects**: Ensure database writes, API calls actually happen
5. **Use realistic data**: Edge cases should match real-world scenarios
6. **Assert precisely**: Specific assertions kill more mutants

## Reporting

### HTML Report
Location: `reports/mutation/index.html`

Shows:
- Mutation score per file
- Survived mutants
- Code coverage
- Individual mutant details

### Console Output
```bash
Mutants killed: 145
Mutants survived: 25
Mutation score: 85.29%
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run mutation tests
  run: npm run mutation
  
- name: Check mutation threshold
  run: |
    SCORE=$(jq '.mutationScore' reports/mutation/mutation-report.json)
    if (( $(echo "$SCORE < 70" | bc -l) )); then
      echo "Mutation score $SCORE% below threshold"
      exit 1
    fi
```

## Resources

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Mutation Testing Concepts](https://en.wikipedia.org/wiki/Mutation_testing)
- Project-specific: See `docs/design.md` for mutation targets

---

**Remember**: A high mutation score indicates strong test quality, not just high code coverage!
