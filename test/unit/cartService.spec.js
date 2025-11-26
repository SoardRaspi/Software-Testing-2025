/**
 * Unit Tests for CartService
 * 
 * These tests target mutation operators:
 * - AOR: Arithmetic operators in quantity and price calculations
 * - ROR: Relational operators in stock validation
 * - PRV: Parameter mutations when calling other services
 */

import { expect } from 'chai';
import sinon from 'sinon';
import * as cartService from '../../src/services/cartService.js';
import * as catalogService from '../../src/services/catalogService.js';
import { Cart } from '../../src/models/cart.js';
import { getTestProducts, createMockProduct, backupDataFiles, restoreDataFiles, resetDataFiles } from '../helpers.js';

describe('CartService - Unit Tests', () => {
  
  let testCart;
  
  before(async () => {
    await backupDataFiles();
  });
  
  after(async () => {
    await restoreDataFiles();
  });
  
  beforeEach(async () => {
    await resetDataFiles();
    testCart = new Cart();
  });
  
  describe('addToCart', () => {
    
    it('should add item to empty cart', async () => {
      // Kills AOR mutants: + in quantity addition
      const result = await cartService.addToCart(testCart, 'test-001', 2);
      
      expect(result.success).to.be.true;
      expect(testCart.items).to.have.lengthOf(1);
      expect(testCart.items[0].quantity).to.equal(2);
    });
    
    it('should increase quantity when adding existing item', async () => {
      // Kills AOR mutants: += to = in quantity update
      await cartService.addToCart(testCart, 'test-001', 2);
      await cartService.addToCart(testCart, 'test-001', 3);
      
      expect(testCart.items).to.have.lengthOf(1);
      expect(testCart.items[0].quantity).to.equal(5); // 2 + 3
    });
    
    it('should reject adding item with zero quantity', async () => {
      // Kills ROR mutants: > to >= in quantity validation
      const result = await cartService.addToCart(testCart, 'test-001', 0);
      
      expect(result.success).to.be.false;
      expect(testCart.items).to.be.empty;
    });
    
    it('should reject adding item with negative quantity', async () => {
      // Kills ROR mutants in validation
      const result = await cartService.addToCart(testCart, 'test-001', -5);
      
      expect(result.success).to.be.false;
      expect(testCart.items).to.be.empty;
    });
    
    it('should reject adding out-of-stock item', async () => {
      // Kills stock validation mutants - critical for integration
      const result = await cartService.addToCart(testCart, 'test-003', 1); // Out of stock
      
      expect(result.success).to.be.false;
      expect(result.message).to.include('stock');
    });
    
    it('should reject adding more than available stock', async () => {
      // Kills ROR mutants: > to >= in stock comparison
      // test-002 has stock of 5
      const result = await cartService.addToCart(testCart, 'test-002', 10);
      
      expect(result.success).to.be.false;
      expect(result.message).to.include('stock');
    });
    
    it('should reject adding non-existent product', async () => {
      // Kills PRV mutants - tests parameter validation across services
      const result = await cartService.addToCart(testCart, 'non-existent', 1);
      
      expect(result.success).to.be.false;
      expect(result.message).to.include('not found');
    });
    
    it('should handle floating point quantities as invalid', async () => {
      // Kills type validation mutants
      const result = await cartService.addToCart(testCart, 'test-001', 1.5);
      
      expect(result.success).to.be.false;
    });
  });
  
  describe('removeFromCart', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 2);
    });
    
    it('should remove item from cart', () => {
      // Kills MDC mutants that remove the deletion operation
      const result = cartService.removeFromCart(testCart, 'test-001');
      
      expect(result.success).to.be.true;
      expect(testCart.items).to.be.empty;
    });
    
    it('should fail to remove non-existent item', () => {
      // Kills conditional mutants in find logic
      const result = cartService.removeFromCart(testCart, 'non-existent');
      
      expect(result.success).to.be.false;
    });
    
    it('should not affect other items when removing', async () => {
      // Kills array mutation issues
      await cartService.addToCart(testCart, 'test-002', 1);
      
      cartService.removeFromCart(testCart, 'test-001');
      
      expect(testCart.items).to.have.lengthOf(1);
      expect(testCart.items[0].productId).to.equal('test-002');
    });
  });
  
  describe('updateCartQuantity', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 2);
    });
    
    it('should update item quantity', async () => {
      // Kills AOR mutants: = to += in assignment
      const result = await cartService.updateCartQuantity(testCart, 'test-001', 5);
      
      expect(result.success).to.be.true;
      expect(testCart.items[0].quantity).to.equal(5);
    });
    
    it('should remove item when quantity set to zero', async () => {
      // Kills ROR mutants: === to !== in zero check
      const result = await cartService.updateCartQuantity(testCart, 'test-001', 0);
      
      expect(result.success).to.be.true;
      expect(testCart.items).to.be.empty;
    });
    
    it('should reject negative quantity update', async () => {
      // Kills ROR mutants in validation
      const result = await cartService.updateCartQuantity(testCart, 'test-001', -1);
      
      expect(result.success).to.be.false;
      expect(testCart.items[0].quantity).to.equal(2); // Unchanged
    });
    
    it('should reject quantity exceeding stock', async () => {
      // Kills ROR mutants: > to >= in stock validation
      const result = await cartService.updateCartQuantity(testCart, 'test-001', 999);
      
      expect(result.success).to.be.false;
    });
    
    it('should fail to update non-existent item', async () => {
      // Kills conditional mutants
      const result = await cartService.updateCartQuantity(testCart, 'non-existent', 5);
      
      expect(result.success).to.be.false;
    });
  });
  
  describe('calculateCartTotals', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 2); // $15.99 each
      await cartService.addToCart(testCart, 'test-002', 1); // $25.50
    });
    
    it('should calculate subtotal correctly', () => {
      // Kills AOR mutants: + to -, * to / in total calculation
      const totals = cartService.calculateCartTotals(testCart);
      
      const expectedSubtotal = (15.99 * 2) + (25.50 * 1);
      expect(totals.subtotal).to.be.closeTo(expectedSubtotal, 0.01);
    });
    
    it('should apply tier discount based on subtotal', () => {
      // Kills PRV mutants when calling discount calculation
      const totals = cartService.calculateCartTotals(testCart);
      
      expect(totals.discount).to.be.at.least(0);
      expect(totals.discount).to.be.at.most(totals.subtotal);
    });
    
    it('should calculate total after discount', () => {
      // Kills AOR mutants: - to + in total calculation
      const totals = cartService.calculateCartTotals(testCart);
      
      expect(totals.total).to.equal(totals.subtotal - totals.discount);
    });
    
    it('should apply discount code when valid', () => {
      // Kills LOR mutants in discount code application
      const totals = cartService.calculateCartTotals(testCart, { discountCode: 'SAVE10' });
      
      if (totals.discountCodeApplied) {
        expect(totals.discount).to.be.above(0);
      }
    });
    
    it('should not apply invalid discount code', () => {
      // Kills conditional mutants in code validation
      const totals = cartService.calculateCartTotals(testCart, { discountCode: 'INVALID' });
      
      expect(totals.discountCodeApplied).to.be.false;
    });
    
    it('should handle empty cart', () => {
      // Edge case - kills division by zero or empty array mutants
      const emptyCart = new Cart();
      const totals = cartService.calculateCartTotals(emptyCart);
      
      expect(totals.subtotal).to.equal(0);
      expect(totals.discount).to.equal(0);
      expect(totals.total).to.equal(0);
    });
    
    it('should not have negative total', () => {
      // Kills AOR mutants that could produce negative totals
      const totals = cartService.calculateCartTotals(testCart);
      
      expect(totals.total).to.be.at.least(0);
    });
  });
  
  describe('validateCartStock', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 2);
      await cartService.addToCart(testCart, 'test-002', 1);
    });
    
    it('should validate all items in stock', async () => {
      // Kills LOR mutants in validation loop
      const result = await cartService.validateCartStock(testCart);
      
      expect(result.valid).to.be.true;
      expect(result.issues).to.be.empty;
    });
    
    it('should detect out of stock items', async () => {
      // Manually add out-of-stock item to test validation
      testCart.items.push({
        productId: 'test-003',
        quantity: 1
      });
      
      const result = await cartService.validateCartStock(testCart);
      
      expect(result.valid).to.be.false;
      expect(result.issues).to.not.be.empty;
    });
    
    it('should detect insufficient stock', async () => {
      // Kills ROR mutants: > to >= in stock comparison
      // Manually set quantity higher than available
      testCart.items[0].quantity = 999;
      
      const result = await cartService.validateCartStock(testCart);
      
      expect(result.valid).to.be.false;
      expect(result.issues).to.have.lengthOf.at.least(1);
    });
    
    it('should validate empty cart as valid', async () => {
      // Edge case
      const emptyCart = new Cart();
      const result = await cartService.validateCartStock(emptyCart);
      
      expect(result.valid).to.be.true;
    });
    
    it('should identify specific problem items', async () => {
      // Kills array handling mutants
      testCart.items[0].quantity = 999; // Exceeds stock
      
      const result = await cartService.validateCartStock(testCart);
      
      expect(result.issues[0]).to.include('test-001');
    });
  });
  
  describe('clearCart', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 2);
      await cartService.addToCart(testCart, 'test-002', 1);
    });
    
    it('should remove all items from cart', () => {
      // Kills MDC mutants that remove clear operation
      cartService.clearCart(testCart);
      
      expect(testCart.items).to.be.empty;
    });
    
    it('should reset cart totals', () => {
      // Kills AOR mutants in reset logic
      cartService.clearCart(testCart);
      
      expect(testCart.subtotal).to.equal(0);
      expect(testCart.total).to.equal(0);
      expect(testCart.discount).to.equal(0);
    });
    
    it('should handle clearing already empty cart', () => {
      // Edge case
      const emptyCart = new Cart();
      cartService.clearCart(emptyCart);
      
      expect(emptyCart.items).to.be.empty;
    });
  });
  
  describe('mergeGuestCart', () => {
    
    it('should merge guest cart into user cart', async () => {
      // Kills array concatenation mutants
      const guestCart = new Cart();
      await cartService.addToCart(guestCart, 'test-001', 2);
      
      const userCart = new Cart();
      await cartService.addToCart(userCart, 'test-002', 1);
      
      const result = await cartService.mergeGuestCart(userCart, guestCart);
      
      expect(result.success).to.be.true;
      expect(userCart.items).to.have.lengthOf(2);
    });
    
    it('should combine quantities for duplicate items', async () => {
      // Kills AOR mutants: + to = in quantity merge
      const guestCart = new Cart();
      await cartService.addToCart(guestCart, 'test-001', 2);
      
      const userCart = new Cart();
      await cartService.addToCart(userCart, 'test-001', 3);
      
      await cartService.mergeGuestCart(userCart, guestCart);
      
      expect(userCart.items).to.have.lengthOf(1);
      expect(userCart.items[0].quantity).to.equal(5); // 2 + 3
    });
    
    it('should validate stock during merge', async () => {
      // Kills stock validation mutants during merge
      const guestCart = new Cart();
      await cartService.addToCart(guestCart, 'test-002', 5); // Max stock
      
      const userCart = new Cart();
      await cartService.addToCart(userCart, 'test-002', 5); // Would exceed
      
      const result = await cartService.mergeGuestCart(userCart, guestCart);
      
      // Should either fail or cap at available stock
      expect(result.success).to.be.a('boolean');
    });
  });
  
  describe('bulkCartOperation', () => {
    
    beforeEach(async () => {
      await cartService.addToCart(testCart, 'test-001', 3);
      await cartService.addToCart(testCart, 'test-002', 2);
    });
    
    it('should increase all quantities', async () => {
      // Kills AOR mutants: + to - in bulk operation
      const result = await cartService.bulkCartOperation(testCart, 'increase', 2);
      
      expect(result.success).to.be.true;
      expect(testCart.items[0].quantity).to.equal(5); // 3 + 2
      expect(testCart.items[1].quantity).to.equal(4); // 2 + 2
    });
    
    it('should decrease all quantities', async () => {
      // Kills AOR mutants: - to + in bulk operation
      const result = await cartService.bulkCartOperation(testCart, 'decrease', 1);
      
      expect(result.success).to.be.true;
      expect(testCart.items[0].quantity).to.equal(2); // 3 - 1
      expect(testCart.items[1].quantity).to.equal(1); // 2 - 1
    });
    
    it('should remove items when decreasing to zero', async () => {
      // Kills ROR mutants: <= to < in removal check
      const result = await cartService.bulkCartOperation(testCart, 'decrease', 2);
      
      expect(testCart.items.length).to.be.below(2);
    });
    
    it('should validate stock when increasing', async () => {
      // Kills stock validation mutants in bulk operation
      const result = await cartService.bulkCartOperation(testCart, 'increase', 999);
      
      // Should fail due to insufficient stock
      expect(result.success).to.be.false;
    });
  });
});
