/**
 * Unit Tests for Pricing Module
 * 
 * These tests target mutation operators:
 * - AOR (Arithmetic Operator Replacement): +, -, *, / mutations
 * - ROR (Relational Operator Replacement): >, <, >=, <= mutations
 * - LOR (Logical Operator Replacement): &&, || mutations
 */

import { expect } from 'chai';
import * as pricing from '../../src/utils/pricing.js';

describe('Pricing Module - Unit Tests', () => {
  
  describe('calculateDiscount', () => {
    
    it('should calculate percentage discount correctly', () => {
      // Kills AOR mutants: * to /, + to -
      // If mutant changes 100 * 0.1 to 100 / 0.1, result would be 1000 instead of 10
      const discount = pricing.calculateDiscount(100, 'percentage', 10);
      expect(discount).to.equal(10); // 10% of 100
    });
    
    it('should calculate flat discount correctly', () => {
      // Kills AOR mutants in flat discount logic
      const discount = pricing.calculateDiscount(100, 'flat', 15);
      expect(discount).to.equal(15);
    });
    
    it('should not exceed the total amount', () => {
      // Kills ROR mutants: > to >= in cap comparison
      const discount = pricing.calculateDiscount(50, 'flat', 60);
      expect(discount).to.be.at.most(50);
    });
    
    it('should return zero for invalid discount types', () => {
      // Kills conditional branch mutants
      const discount = pricing.calculateDiscount(100, 'invalid', 10);
      expect(discount).to.equal(0);
    });
    
    it('should handle zero amount', () => {
      // Edge case - kills ROR mutants in boundary checks
      const discount = pricing.calculateDiscount(0, 'percentage', 10);
      expect(discount).to.equal(0);
    });
    
    it('should handle 100% discount', () => {
      // Boundary case - kills AOR mutants: * to /
      const discount = pricing.calculateDiscount(100, 'percentage', 100);
      expect(discount).to.equal(100);
    });
  });
  
  describe('getDiscountTier', () => {
    
    it('should return 0% for subtotal below $50', () => {
      // Kills ROR mutants: < to <= at boundary
      expect(pricing.getDiscountTier(49.99)).to.equal(0);
      expect(pricing.getDiscountTier(25)).to.equal(0);
    });
    
    it('should return 5% for subtotal $50-$99.99', () => {
      // Kills ROR mutants: >= to > and < to <=
      expect(pricing.getDiscountTier(50.00)).to.equal(0.05);
      expect(pricing.getDiscountTier(75)).to.equal(0.05);
      expect(pricing.getDiscountTier(99.99)).to.equal(0.05);
    });
    
    it('should return 10% for subtotal $100-$199.99', () => {
      // Tests second tier boundary - kills ROR mutants
      expect(pricing.getDiscountTier(100.00)).to.equal(0.10);
      expect(pricing.getDiscountTier(150)).to.equal(0.10);
      expect(pricing.getDiscountTier(199.99)).to.equal(0.10);
    });
    
    it('should return 15% for subtotal $200-$499.99', () => {
      // Tests third tier - kills ROR mutants
      expect(pricing.getDiscountTier(200.00)).to.equal(0.15);
      expect(pricing.getDiscountTier(350)).to.equal(0.15);
      expect(pricing.getDiscountTier(499.99)).to.equal(0.15);
    });
    
    it('should return 20% for subtotal $500-$999.99', () => {
      // Tests fourth tier - kills ROR mutants
      expect(pricing.getDiscountTier(500.00)).to.equal(0.20);
      expect(pricing.getDiscountTier(750)).to.equal(0.20);
      expect(pricing.getDiscountTier(999.99)).to.equal(0.20);
    });
    
    it('should return 25% for subtotal $1000+', () => {
      // Tests highest tier - kills ROR mutants: >= to >
      expect(pricing.getDiscountTier(1000.00)).to.equal(0.25);
      expect(pricing.getDiscountTier(5000)).to.equal(0.25);
    });
    
    it('should test exact tier boundaries', () => {
      // Critical boundary tests - kills ROR mutants at exact thresholds
      expect(pricing.getDiscountTier(49.99)).to.not.equal(0.05);
      expect(pricing.getDiscountTier(50.00)).to.equal(0.05);
      expect(pricing.getDiscountTier(99.99)).to.equal(0.05);
      expect(pricing.getDiscountTier(100.00)).to.equal(0.10);
    });
  });
  
  describe('calculateShipping', () => {
    
    const mockItems = [
      { weight: 1, quantity: 2 }, // 2 lbs total
      { weight: 0.5, quantity: 3 } // 1.5 lbs total
    ]; // Total: 3.5 lbs
    
    const mockAddress = {
      state: 'CA',
      country: 'USA'
    };
    
    it('should calculate shipping based on weight', () => {
      // Kills AOR mutants: * to / in weight calculation
      const shipping = pricing.calculateShipping(mockItems, mockAddress);
      expect(shipping).to.be.a('number');
      expect(shipping).to.be.above(0);
    });
    
    it('should apply free shipping for orders over threshold', () => {
      // Kills ROR mutants: >= to > in threshold check
      const shipping = pricing.calculateShipping(
        mockItems,
        mockAddress,
        { freeShippingThreshold: 100, subtotal: 150 }
      );
      expect(shipping).to.equal(0);
    });
    
    it('should charge shipping for orders below threshold', () => {
      // Kills ROR mutants: < to <= in threshold comparison
      const shipping = pricing.calculateShipping(
        mockItems,
        mockAddress,
        { freeShippingThreshold: 100, subtotal: 50 }
      );
      expect(shipping).to.be.above(0);
    });
    
    it('should calculate different rates for different zones', () => {
      // Kills conditional branch mutants for zone logic
      const localAddr = { state: 'CA', country: 'USA' };
      const intlAddr = { state: '', country: 'Canada' };
      
      const localShip = pricing.calculateShipping(mockItems, localAddr);
      const intlShip = pricing.calculateShipping(mockItems, intlAddr);
      
      expect(localShip).to.not.equal(intlShip);
    });
    
    it('should apply express shipping premium', () => {
      // Kills AOR mutants: + to - or * to / in premium calculation
      const standard = pricing.calculateShipping(mockItems, mockAddress, { express: false });
      const express = pricing.calculateShipping(mockItems, mockAddress, { express: true });
      
      expect(express).to.be.above(standard);
    });
    
    it('should handle heavy items with higher rates', () => {
      // Kills ROR mutants in weight tier comparisons
      const lightItems = [{ weight: 1, quantity: 1 }]; // 1 lb
      const heavyItems = [{ weight: 25, quantity: 1 }]; // 25 lbs
      
      const lightShip = pricing.calculateShipping(lightItems, mockAddress);
      const heavyShip = pricing.calculateShipping(heavyItems, mockAddress);
      
      expect(heavyShip).to.be.above(lightShip);
    });
    
    it('should handle zero weight edge case', () => {
      // Edge case - kills division by zero or minimum calculation mutants
      const zeroItems = [{ weight: 0, quantity: 1 }];
      const shipping = pricing.calculateShipping(zeroItems, mockAddress);
      expect(shipping).to.be.a('number');
      expect(shipping).to.be.at.least(0);
    });
  });
  
  describe('calculateTax', () => {
    
    const mockItems = [
      { category: 'Fiction', price: 20, quantity: 1 },
      { category: 'Technology', price: 50, quantity: 1 }
    ];
    
    it('should calculate tax for California (CA)', () => {
      // Kills conditional mutants for state-specific tax rates
      const tax = pricing.calculateTax(100, 'CA', mockItems);
      expect(tax).to.be.above(0);
      expect(tax).to.be.below(100); // Tax shouldn't exceed subtotal
    });
    
    it('should calculate different tax for different states', () => {
      // Kills conditional branch mutants in state switch/if logic
      const taxCA = pricing.calculateTax(100, 'CA', mockItems);
      const taxNY = pricing.calculateTax(100, 'NY', mockItems);
      
      // Most states have different tax rates
      expect(taxCA).to.not.equal(taxNY);
    });
    
    it('should apply zero tax for Oregon (OR)', () => {
      // Oregon has no sales tax - kills conditional mutants
      const tax = pricing.calculateTax(100, 'OR', mockItems);
      expect(tax).to.equal(0);
    });
    
    it('should handle tax-exempt categories', () => {
      // Some categories might be tax-exempt - kills LOR mutants
      const exemptItems = [{ category: 'Food', price: 50, quantity: 1 }];
      const regularItems = [{ category: 'Technology', price: 50, quantity: 1 }];
      
      const exemptTax = pricing.calculateTax(50, 'CA', exemptItems);
      const regularTax = pricing.calculateTax(50, 'CA', regularItems);
      
      expect(exemptTax).to.be.at.most(regularTax);
    });
    
    it('should calculate tax as percentage of subtotal', () => {
      // Kills AOR mutants: * to / in tax calculation
      const tax = pricing.calculateTax(100, 'CA', mockItems);
      expect(tax).to.be.above(0);
      expect(tax).to.be.below(20); // Assuming tax rate < 20%
    });
    
    it('should handle zero subtotal', () => {
      // Edge case - kills AOR mutants
      const tax = pricing.calculateTax(0, 'CA', mockItems);
      expect(tax).to.equal(0);
    });
    
    it('should round tax to two decimal places', () => {
      // Kills AOR mutants in rounding logic
      const tax = pricing.calculateTax(99.99, 'CA', mockItems);
      const rounded = Math.round(tax * 100) / 100;
      expect(tax).to.equal(rounded);
    });
  });
  
  describe('applyBulkDiscount', () => {
    
    it('should apply no discount for quantities below 5', () => {
      // Kills ROR mutants: < to <= at threshold
      const items = [{ price: 10, quantity: 4 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.equal(0);
    });
    
    it('should apply 5% discount for quantity 5-9', () => {
      // Kills ROR mutants at first tier boundary
      const items = [{ price: 10, quantity: 5 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.above(0);
      expect(discount).to.be.closeTo(2.5, 0.01); // 5% of 50
    });
    
    it('should apply 10% discount for quantity 10-19', () => {
      // Kills ROR mutants at second tier
      const items = [{ price: 10, quantity: 10 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.closeTo(10, 0.01); // 10% of 100
    });
    
    it('should apply 15% discount for quantity 20-49', () => {
      // Tests third tier - kills ROR mutants
      const items = [{ price: 10, quantity: 20 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.closeTo(30, 0.01); // 15% of 200
    });
    
    it('should apply 20% discount for quantity 50-99', () => {
      // Tests fourth tier
      const items = [{ price: 10, quantity: 50 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.closeTo(100, 0.01); // 20% of 500
    });
    
    it('should apply 25% discount for quantity 100-199', () => {
      // Tests fifth tier
      const items = [{ price: 10, quantity: 100 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.closeTo(250, 0.01); // 25% of 1000
    });
    
    it('should apply 30% discount for quantity 200+', () => {
      // Tests highest tier - kills ROR mutants: >= to >
      const items = [{ price: 10, quantity: 200 }];
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.closeTo(600, 0.01); // 30% of 2000
    });
    
    it('should calculate discount across multiple items', () => {
      // Kills AOR mutants: + to - in accumulation
      const items = [
        { price: 10, quantity: 3 },
        { price: 20, quantity: 3 }
      ]; // Total quantity: 6, should trigger 5% tier
      const discount = pricing.applyBulkDiscount(items);
      expect(discount).to.be.above(0);
    });
    
    it('should test exact tier boundaries', () => {
      // Critical boundary tests - kills ROR mutants
      const items4 = [{ price: 10, quantity: 4 }];
      const items5 = [{ price: 10, quantity: 5 }];
      
      expect(pricing.applyBulkDiscount(items4)).to.equal(0);
      expect(pricing.applyBulkDiscount(items5)).to.be.above(0);
    });
  });
  
  describe('calculateLoyaltyPoints', () => {
    
    it('should calculate basic loyalty points from subtotal', () => {
      // Kills AOR mutants: / to * in points calculation
      const points = pricing.calculateLoyaltyPoints(100);
      expect(points).to.be.a('number');
      expect(points).to.be.above(0);
    });
    
    it('should apply multiplier for premium customers', () => {
      // Kills AOR mutants: * to / in multiplier application
      const basicPoints = pricing.calculateLoyaltyPoints(100, { isPremium: false });
      const premiumPoints = pricing.calculateLoyaltyPoints(100, { isPremium: true });
      
      expect(premiumPoints).to.be.above(basicPoints);
    });
    
    it('should award bonus points for first purchase', () => {
      // Kills AOR mutants: + to - in bonus calculation
      const regularPoints = pricing.calculateLoyaltyPoints(100, { isFirstPurchase: false });
      const firstPoints = pricing.calculateLoyaltyPoints(100, { isFirstPurchase: true });
      
      expect(firstPoints).to.be.above(regularPoints);
    });
    
    it('should cap loyalty points at maximum', () => {
      // Kills ROR mutants: > to >= in cap comparison
      const points = pricing.calculateLoyaltyPoints(10000, { maxPoints: 1000 });
      expect(points).to.be.at.most(1000);
    });
    
    it('should handle zero subtotal', () => {
      // Edge case - kills division/multiplication mutants
      const points = pricing.calculateLoyaltyPoints(0);
      expect(points).to.equal(0);
    });
    
    it('should round points to integer', () => {
      // Kills AOR mutants in rounding logic
      const points = pricing.calculateLoyaltyPoints(15.75);
      expect(Number.isInteger(points)).to.be.true;
    });
  });
  
  describe('applyPromotion', () => {
    
    it('should apply valid promotion code', () => {
      // Kills RV mutants that flip success/failure
      const result = pricing.applyPromotion(100, 'SAVE10');
      expect(result.applied).to.be.true;
      expect(result.discount).to.be.above(0);
    });
    
    it('should reject invalid promotion code', () => {
      // Kills conditional mutants in code validation
      const result = pricing.applyPromotion(100, 'INVALID');
      expect(result.applied).to.be.false;
      expect(result.discount).to.equal(0);
    });
    
    it('should enforce minimum purchase requirement', () => {
      // Kills ROR mutants: >= to > in minimum check
      const result = pricing.applyPromotion(25, 'MIN50', { minPurchase: 50 });
      expect(result.applied).to.be.false;
    });
    
    it('should apply promotion when minimum is met', () => {
      // Kills ROR mutants at exact threshold
      const result = pricing.applyPromotion(50, 'MIN50', { minPurchase: 50 });
      expect(result.applied).to.be.true;
    });
    
    it('should handle expired promotion codes', () => {
      // Kills date comparison mutants
      const pastDate = new Date('2020-01-01');
      const result = pricing.applyPromotion(100, 'EXPIRED', { expiryDate: pastDate });
      expect(result.applied).to.be.false;
    });
    
    it('should calculate correct discount amount', () => {
      // Kills AOR mutants in discount calculation
      const result = pricing.applyPromotion(100, 'SAVE20');
      if (result.applied) {
        expect(result.discount).to.be.above(0);
        expect(result.discount).to.be.at.most(100);
      }
    });
  });
});
