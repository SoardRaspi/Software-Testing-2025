/**
 * Unit Tests for Pricing Utilities
 * 
 * Tests target mutation operators:
 * - AOR: Arithmetic operators (*, /, +, -)
 * - ROR: Relational operators (>=, <=, >, <)
 * - LOR: Logical operators (&&, ||)
 * - Boolean literals in conditions
 */

import assert from 'assert';
import * as pricing from '../../src/utils/pricing.js';

describe('Pricing Utils - Unit Tests', () => {

  describe('calculateDiscount', () => {
    describe('percentage discount', () => {
      it('should calculate valid percentage discount', () => {
        const result = pricing.calculateDiscount(100, 'percentage', 10);
        assert.strictEqual(result, 10);
      });

      it('should handle 0% discount', () => {
        const result = pricing.calculateDiscount(100, 'percentage', 0);
        assert.strictEqual(result, 0);
      });

      it('should handle 100% discount', () => {
        const result = pricing.calculateDiscount(100, 'percentage', 100);
        assert.strictEqual(result, 100);
      });

      it('should cap percentage at 100%', () => {
        const result = pricing.calculateDiscount(100, 'percentage', 150);
        assert.strictEqual(result, 100);
      });

      it('should cap percentage at exactly 100%', () => {
        const result = pricing.calculateDiscount(100, 'percentage', 101);
        assert.strictEqual(result, 100);
      });

      it('should handle negative percentage as 0', () => {
        const result = pricing.calculateDiscount(100, 'percentage', -10);
        assert.strictEqual(result, 0);
      });

      it('should calculate percentage of large subtotal', () => {
        const result = pricing.calculateDiscount(1000, 'percentage', 25);
        assert.strictEqual(result, 250);
      });

      it('should return 0 for subtotal exactly 0', () => {
        const result = pricing.calculateDiscount(0, 'percentage', 10);
        assert.strictEqual(result, 0);
      });
    });

    describe('fixed discount', () => {
      it('should apply fixed discount', () => {
        const result = pricing.calculateDiscount(100, 'fixed', 20);
        assert.strictEqual(result, 20);
      });

      it('should cap fixed discount at subtotal', () => {
        const result = pricing.calculateDiscount(50, 'fixed', 100);
        assert.strictEqual(result, 50);
      });

      it('should handle 0 fixed discount', () => {
        const result = pricing.calculateDiscount(100, 'fixed', 0);
        assert.strictEqual(result, 0);
      });

      it('should handle negative fixed discount as 0', () => {
        const result = pricing.calculateDiscount(100, 'fixed', -20);
        assert.strictEqual(result, 0);
      });

      it('should handle fixed discount equal to subtotal', () => {
        const result = pricing.calculateDiscount(100, 'fixed', 100);
        assert.strictEqual(result, 100);
      });

      it('should cap discount when exceeds subtotal by 1', () => {
        const result = pricing.calculateDiscount(50, 'fixed', 51);
        assert.strictEqual(result, 50);
      });
    });

    describe('invalid inputs', () => {
      it('should return 0 for invalid discount type', () => {
        const result = pricing.calculateDiscount(100, 'invalid', 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative subtotal', () => {
        const result = pricing.calculateDiscount(-100, 'percentage', 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number subtotal', () => {
        const result = pricing.calculateDiscount('100', 'percentage', 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number discount value', () => {
        const result = pricing.calculateDiscount(100, 'percentage', '10');
        assert.strictEqual(result, 0);
      });

      it('should return 0 for null discount type', () => {
        const result = pricing.calculateDiscount(100, null, 10);
        assert.strictEqual(result, 0);
      });
    });
  });

  describe('getDiscountTier', () => {
    it('should return 0 for $0', () => {
      const result = pricing.getDiscountTier(0);
      assert.strictEqual(result, 0);
    });

    it('should return 0 for $49.99', () => {
      const result = pricing.getDiscountTier(49.99);
      assert.strictEqual(result, 0);
    });

    it('should return 0.05 for exactly $50', () => {
      const result = pricing.getDiscountTier(50);
      assert.strictEqual(result, 0.05);
    });

    it('should return 0.05 for $99.99', () => {
      const result = pricing.getDiscountTier(99.99);
      assert.strictEqual(result, 0.05);
    });

    it('should return 0.10 for exactly $100', () => {
      const result = pricing.getDiscountTier(100);
      assert.strictEqual(result, 0.10);
    });

    it('should return 0.10 for $199.99', () => {
      const result = pricing.getDiscountTier(199.99);
      assert.strictEqual(result, 0.10);
    });

    it('should return 0.15 for exactly $200', () => {
      const result = pricing.getDiscountTier(200);
      assert.strictEqual(result, 0.15);
    });

    it('should return 0.15 for $499.99', () => {
      const result = pricing.getDiscountTier(499.99);
      assert.strictEqual(result, 0.15);
    });

    it('should return 0.20 for exactly $500', () => {
      const result = pricing.getDiscountTier(500);
      assert.strictEqual(result, 0.20);
    });

    it('should return 0.20 for $999.99', () => {
      const result = pricing.getDiscountTier(999.99);
      assert.strictEqual(result, 0.20);
    });

    it('should return 0.25 for exactly $1000', () => {
      const result = pricing.getDiscountTier(1000);
      assert.strictEqual(result, 0.25);
    });

    it('should return 0.25 for $10000', () => {
      const result = pricing.getDiscountTier(10000);
      assert.strictEqual(result, 0.25);
    });

    it('should return 0 for negative subtotal', () => {
      const result = pricing.getDiscountTier(-100);
      assert.strictEqual(result, 0);
    });

    it('should return 0 for non-number input', () => {
      const result = pricing.getDiscountTier('500');
      assert.strictEqual(result, 0);
    });

    it('should return 0 for exactly 0', () => {
      const result = pricing.getDiscountTier(0);
      assert.strictEqual(result, 0);
    });
  });

  describe('getDiscountTierInfo', () => {
    it('should return no discount info for $0', () => {
      const result = pricing.getDiscountTierInfo(0);
      assert.strictEqual(result.percentage, 0);
      assert.strictEqual(result.minPurchase, 0);
      assert.strictEqual(result.name, 'none');
    });

    it('should return bronze tier info for $50', () => {
      const result = pricing.getDiscountTierInfo(50);
      assert.strictEqual(result.percentage, 5);
      assert.strictEqual(result.minPurchase, 50);
      assert.strictEqual(result.name, 'bronze');
    });

    it('should return silver tier info for $100', () => {
      const result = pricing.getDiscountTierInfo(100);
      assert.strictEqual(result.percentage, 10);
      assert.strictEqual(result.minPurchase, 100);
      assert.strictEqual(result.name, 'silver');
    });

    it('should return gold tier info for $150', () => {
      const result = pricing.getDiscountTierInfo(150);
      assert.strictEqual(result.percentage, 15);
      assert.strictEqual(result.minPurchase, 150);
      assert.strictEqual(result.name, 'gold');
    });

    it('should return platinum tier info for $200', () => {
      const result = pricing.getDiscountTierInfo(200);
      assert.strictEqual(result.percentage, 20);
      assert.strictEqual(result.minPurchase, 200);
      assert.strictEqual(result.name, 'platinum');
    });

    it('should return platinum tier info for $500', () => {
      const result = pricing.getDiscountTierInfo(500);
      assert.strictEqual(result.percentage, 20);
      assert.strictEqual(result.minPurchase, 200);
      assert.strictEqual(result.name, 'platinum');
    });
  });

  describe('calculateShipping', () => {
    describe('free shipping threshold', () => {
      it('should charge shipping for subtotal under $75', () => {
        const result = pricing.calculateShipping(1, 'local', 50, 'standard');
        assert.strictEqual(result, 5.99);
      });

      it('should be free for subtotal at $75', () => {
        const result = pricing.calculateShipping(1, 'local', 75, 'standard');
        assert.strictEqual(result, 0);
      });

      it('should be free for subtotal over $75', () => {
        const result = pricing.calculateShipping(1, 'local', 100, 'standard');
        assert.strictEqual(result, 0);
      });
    });

    describe('shipping zones', () => {
      it('should calculate local zone shipping', () => {
        const result = pricing.calculateShipping(1, 'local', 50, 'standard');
        assert.strictEqual(result, 5.99);
      });

      it('should calculate regional zone shipping', () => {
        const result = pricing.calculateShipping(1, 'regional', 50, 'standard');
        assert.strictEqual(result, 8.99);
      });

      it('should calculate national zone shipping', () => {
        const result = pricing.calculateShipping(1, 'national', 50, 'standard');
        assert.strictEqual(result, 12.99);
      });

      it('should calculate international zone shipping', () => {
        const result = pricing.calculateShipping(1, 'international', 50, 'standard');
        assert.strictEqual(result, 25.99);
      });

      it('should default to 8.99 for invalid zone', () => {
        const result = pricing.calculateShipping(1, 'unknown', 50, 'standard');
        assert.strictEqual(result, 8.99);
      });
    });

    describe('weight surcharge', () => {
      it('should not charge extra for weight at 5kg', () => {
        const result = pricing.calculateShipping(5, 'local', 50, 'standard');
        assert.strictEqual(result, 5.99);
      });

      it('should charge extra for weight above 5kg boundary', () => {
        const result = pricing.calculateShipping(5.1, 'local', 50, 'standard');
        const expected = 5.99 + (0.1 * 2.50);
        assert.strictEqual(result, Math.round(expected * 100) / 100);
      });

      it('should charge extra for weight at 6kg', () => {
        const result = pricing.calculateShipping(6, 'local', 50, 'standard');
        assert.strictEqual(result, 8.49); // 5.99 + 2.50
      });

      it('should charge extra for weight at 10kg', () => {
        const result = pricing.calculateShipping(10, 'local', 50, 'standard');
        assert.strictEqual(result, 18.49); // 5.99 + 12.50
      });

      it('should handle fractional weight', () => {
        const result = pricing.calculateShipping(7.5, 'local', 50, 'standard');
        assert.strictEqual(result, 12.24); // 5.99 + 6.25
      });
    });

    describe('shipping speed', () => {
      it('should use base rate for standard shipping', () => {
        const result = pricing.calculateShipping(1, 'local', 50, 'standard');
        assert.strictEqual(result, 5.99);
      });

      it('should apply 1.5x multiplier for express shipping', () => {
        const result = pricing.calculateShipping(1, 'local', 50, 'express');
        assert.strictEqual(result, 8.99); // 5.99 * 1.5
      });

      it('should apply express to regional', () => {
        const result = pricing.calculateShipping(1, 'regional', 50, 'express');
        assert.strictEqual(result, 13.49); // 8.99 * 1.5
      });
    });

    describe('combined factors', () => {
      it('should handle weight + express', () => {
        const result = pricing.calculateShipping(10, 'local', 50, 'express');
        assert.strictEqual(result, 27.74); // (5.99 + 12.50) * 1.5
      });

      it('should handle international + weight + express', () => {
        const result = pricing.calculateShipping(10, 'international', 50, 'express');
        assert.strictEqual(result, 57.73); // (25.99 + 12.50) * 1.5 rounded
      });

      it('should handle free shipping threshold with express', () => {
        const result = pricing.calculateShipping(1, 'local', 75, 'express');
        assert.strictEqual(result, 0);
      });
    });

    describe('invalid inputs', () => {
      it('should return 0 for negative weight', () => {
        const result = pricing.calculateShipping(-1, 'local', 50, 'standard');
        assert.strictEqual(result, 0);
      });

      it('should not validate negative subtotal', () => {
        const result = pricing.calculateShipping(1, 'local', -50, 'standard');
        assert.strictEqual(result, 5.99); // Doesn't check subtotal negativity
      });

      it('should return 0 for non-number weight', () => {
        const result = pricing.calculateShipping('1', 'local', 50, 'standard');
        assert.strictEqual(result, 0);
      });

      it('should not validate non-number subtotal type', () => {
        const result = pricing.calculateShipping(1, 'local', '50', 'standard');
        assert.strictEqual(result, 5.99); // Doesn't validate subtotal type
      });
    });
  });

  describe('calculateTax', () => {
    describe('state tax rates', () => {
      it('should calculate CA tax at 7.25%', () => {
        const result = pricing.calculateTax(100, 'CA', 'general');
        assert.strictEqual(result, 7.25);
      });

      it('should calculate NY tax at 8%', () => {
        const result = pricing.calculateTax(100, 'NY', 'general');
        assert.strictEqual(result, 8);
      });

      it('should calculate TX tax at 6.25%', () => {
        const result = pricing.calculateTax(100, 'TX', 'general');
        assert.strictEqual(result, 6.25);
      });

      it('should calculate FL tax at 6%', () => {
        const result = pricing.calculateTax(100, 'FL', 'general');
        assert.strictEqual(result, 6);
      });

      it('should calculate IL tax at 6.25%', () => {
        const result = pricing.calculateTax(100, 'IL', 'general');
        assert.strictEqual(result, 6.25);
      });

      it('should calculate PA tax at 6%', () => {
        const result = pricing.calculateTax(100, 'PA', 'general');
        assert.strictEqual(result, 6);
      });

      it('should calculate OH tax at 5.75%', () => {
        const result = pricing.calculateTax(100, 'OH', 'general');
        assert.strictEqual(result, 5.75);
      });

      it('should default to 7% for unknown state', () => {
        const result = pricing.calculateTax(100, 'WA', 'general');
        assert.strictEqual(result, 7);
      });
    });

    describe('tax-exempt categories', () => {
      it('should be tax-exempt for education category', () => {
        const result = pricing.calculateTax(100, 'CA', 'education');
        assert.strictEqual(result, 0);
      });

      it('should be tax-exempt for children category', () => {
        const result = pricing.calculateTax(100, 'NY', 'children');
        assert.strictEqual(result, 0);
      });

      it('should apply tax to non-exempt categories', () => {
        const result = pricing.calculateTax(100, 'CA', 'electronics');
        assert.strictEqual(result, 7.25);
      });
    });

    describe('edge cases', () => {
      it('should return 0 for zero amount', () => {
        const result = pricing.calculateTax(0, 'CA', 'general');
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative amount', () => {
        const result = pricing.calculateTax(-100, 'CA', 'general');
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number amount', () => {
        const result = pricing.calculateTax('100', 'CA', 'general');
        assert.strictEqual(result, 0);
      });

      it('should handle large amounts', () => {
        const result = pricing.calculateTax(10000, 'CA', 'general');
        assert.strictEqual(result, 725);
      });

      it('should handle decimal amounts', () => {
        const result = pricing.calculateTax(99.99, 'CA', 'general');
        assert.strictEqual(result, 7.25);
      });
    });
  });

  describe('applyBulkDiscount', () => {
    it('should return 0 discount for quantity 1', () => {
      const result = pricing.applyBulkDiscount(1, 10);
      assert.strictEqual(result, 0);
    });

    it('should return 0 discount for quantity 4', () => {
      const result = pricing.applyBulkDiscount(4, 10);
      assert.strictEqual(result, 0);
    });

    it('should return 5% discount at quantity 5', () => {
      const result = pricing.applyBulkDiscount(5, 10);
      assert.strictEqual(result, 2.5); // 5% of 50
    });

    it('should return 5% discount at quantity 9', () => {
      const result = pricing.applyBulkDiscount(9, 10);
      assert.strictEqual(result, 4.5); // 5% of 90
    });

    it('should return 10% discount at quantity 10', () => {
      const result = pricing.applyBulkDiscount(10, 10);
      assert.strictEqual(result, 10); // 10% of 100
    });

    it('should return 10% discount at quantity 24', () => {
      const result = pricing.applyBulkDiscount(24, 10);
      assert.strictEqual(result, 24); // 10% of 240
    });

    it('should return 15% discount at quantity 25', () => {
      const result = pricing.applyBulkDiscount(25, 10);
      assert.strictEqual(result, 37.5); // 15% of 250
    });

    it('should return 15% discount at quantity 49', () => {
      const result = pricing.applyBulkDiscount(49, 10);
      assert.strictEqual(result, 73.5); // 15% of 490
    });

    it('should return 20% discount at quantity 50', () => {
      const result = pricing.applyBulkDiscount(50, 10);
      assert.strictEqual(result, 100); // 20% of 500
    });

    it('should return 20% discount at quantity 99', () => {
      const result = pricing.applyBulkDiscount(99, 10);
      assert.strictEqual(result, 198); // 20% of 990
    });

    it('should return 25% discount at quantity 100', () => {
      const result = pricing.applyBulkDiscount(100, 10);
      assert.strictEqual(result, 250); // 25% of 1000
    });

    it('should return 25% discount at quantity 200', () => {
      const result = pricing.applyBulkDiscount(200, 10);
      assert.strictEqual(result, 500); // 25% of 2000
    });

    describe('invalid inputs', () => {
      it('should return 0 for zero quantity', () => {
        const result = pricing.applyBulkDiscount(0, 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative quantity', () => {
        const result = pricing.applyBulkDiscount(-5, 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-integer quantity', () => {
        const result = pricing.applyBulkDiscount(5.5, 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number quantity', () => {
        const result = pricing.applyBulkDiscount('10', 10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative price', () => {
        const result = pricing.applyBulkDiscount(10, -10);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number price', () => {
        const result = pricing.applyBulkDiscount(10, '10');
        assert.strictEqual(result, 0);
      });
    });
  });

  describe('applyBulkDiscountDetailed', () => {
    it('should return detailed info for quantity 5', () => {
      const result = pricing.applyBulkDiscountDetailed(5, 10);
      assert.strictEqual(result.totalPrice, 50);
      assert.strictEqual(result.discount, 2.5);
      assert.strictEqual(result.discountPercentage, 5);
      assert.strictEqual(result.finalPrice, 47.5);
    });

    it('should return detailed info for quantity 10', () => {
      const result = pricing.applyBulkDiscountDetailed(10, 10);
      assert.strictEqual(result.discountPercentage, 10);
    });

    it('should return detailed info for quantity 20', () => {
      const result = pricing.applyBulkDiscountDetailed(20, 10);
      assert.strictEqual(result.discountPercentage, 15);
    });

    it('should return detailed info for quantity 50', () => {
      const result = pricing.applyBulkDiscountDetailed(50, 10);
      assert.strictEqual(result.discountPercentage, 20);
    });

    it('should return detailed info for quantity 100', () => {
      const result = pricing.applyBulkDiscountDetailed(100, 10);
      assert.strictEqual(result.totalPrice, 1000);
      assert.strictEqual(result.discount, 250);
      assert.strictEqual(result.discountPercentage, 25);
      assert.strictEqual(result.finalPrice, 750);
    });

    it('should return detailed info for quantity 200', () => {
      const result = pricing.applyBulkDiscountDetailed(200, 10);
      assert.strictEqual(result.discountPercentage, 30);
    });

    it('should return zeros for invalid quantity', () => {
      const result = pricing.applyBulkDiscountDetailed(-5, 10);
      assert.strictEqual(result.totalPrice, 0);
      assert.strictEqual(result.discount, 0);
      assert.strictEqual(result.finalPrice, 0);
    });

    it('should return zeros for invalid price', () => {
      const result = pricing.applyBulkDiscountDetailed(10, -10);
      assert.strictEqual(result.totalPrice, 0);
      assert.strictEqual(result.discount, 0);
      assert.strictEqual(result.finalPrice, 0);
    });

    it('should return zeros for zero quantity', () => {
      const result = pricing.applyBulkDiscountDetailed(0, 10);
      assert.strictEqual(result.totalPrice, 0);
    });
  });

  describe('calculateLoyaltyPoints', () => {
    describe('basic tier', () => {
      it('should calculate 1x points + bonus for basic tier', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'basic', false);
        assert.strictEqual(result, 150); // 100 points + 50 bonus
      });

      it('should double points on birthday + bonus', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'basic', true);
        assert.strictEqual(result, 250); // 200 points + 50 bonus
      });

      it('should add bonus 25 at $50', () => {
        const result = pricing.calculateLoyaltyPoints(50, 'basic', false);
        assert.strictEqual(result, 75);
      });

      it('should add bonus 50 at $100', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'basic', false);
        assert.strictEqual(result, 150);
      });

      it('should add bonus 100 at $200', () => {
        const result = pricing.calculateLoyaltyPoints(200, 'basic', false);
        assert.strictEqual(result, 300);
      });
    });

    describe('silver tier', () => {
      it('should calculate 2x points for silver tier', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'silver', false);
        assert.strictEqual(result, 250);
      });

      it('should calculate 4x points on birthday', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'silver', true);
        assert.strictEqual(result, 450);
      });
    });

    describe('gold tier', () => {
      it('should calculate 3x points for gold tier', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'gold', false);
        assert.strictEqual(result, 350);
      });

      it('should calculate 6x points on birthday', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'gold', true);
        assert.strictEqual(result, 650);
      });
    });

    describe('platinum tier', () => {
      it('should calculate 5x points for platinum tier', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'platinum', false);
        assert.strictEqual(result, 550);
      });

      it('should calculate 10x points on birthday', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'platinum', true);
        assert.strictEqual(result, 1050);
      });
    });

    describe('points cap', () => {
      it('should cap at 10000 points', () => {
        const result = pricing.calculateLoyaltyPoints(5000, 'platinum', true);
        assert.strictEqual(result, 10000);
      });

      it('should not exceed 10000 points', () => {
        const result = pricing.calculateLoyaltyPoints(10000, 'platinum', true);
        assert.strictEqual(result, 10000);
      });

      it('should cap exactly at 10000 boundary', () => {
        const result = pricing.calculateLoyaltyPoints(3000, 'platinum', false);
        assert.strictEqual(result, 10000); // 3000*5 + 100 = 15100, capped
      });
    });

    describe('invalid inputs', () => {
      it('should return 0 for negative amount', () => {
        const result = pricing.calculateLoyaltyPoints(-100, 'basic', false);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for zero amount', () => {
        const result = pricing.calculateLoyaltyPoints(0, 'basic', false);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number amount', () => {
        const result = pricing.calculateLoyaltyPoints('100', 'basic', false);
        assert.strictEqual(result, 0);
      });

      it('should default to basic for unknown tier', () => {
        const result = pricing.calculateLoyaltyPoints(100, 'unknown', false);
        assert.strictEqual(result, 150);
      });

      it('should return 0 for amount exactly 0', () => {
        const result = pricing.calculateLoyaltyPoints(0, 'platinum', false);
        assert.strictEqual(result, 0);
      });
    });
  });

  describe('applyPromotion', () => {
    describe('WELCOME10 code', () => {
      it('should apply 10% discount', () => {
        const result = pricing.applyPromotion(100, 'WELCOME10', {});
        assert.strictEqual(result, true);
      });

      it('should handle lowercase code', () => {
        const result = pricing.applyPromotion(100, 'welcome10', {});
        assert.strictEqual(result, true);
      });

      it('should handle code with spaces', () => {
        const result = pricing.applyPromotion(100, '  WELCOME10  ', {});
        assert.strictEqual(result, true);
      });
    });

    describe('SAVE20 code', () => {
      it('should apply 20% with $50+ purchase', () => {
        const result = pricing.applyPromotion(50, 'SAVE20', {});
        assert.strictEqual(result, true);
      });

      it('should not apply below $50', () => {
        const result = pricing.applyPromotion(49, 'SAVE20', {});
        assert.strictEqual(result, false);
      });

      it('should not apply at exactly $49.99', () => {
        const result = pricing.applyPromotion(49.99, 'SAVE20', {});
        assert.strictEqual(result, false);
      });
    });

    describe('CLEARANCE30 code', () => {
      it('should apply 30% for clearance items', () => {
        const result = pricing.applyPromotion(100, 'CLEARANCE30', { isClearance: true });
        assert.strictEqual(result, true);
      });

      it('should not apply for non-clearance', () => {
        const result = pricing.applyPromotion(100, 'CLEARANCE30', { isClearance: false });
        assert.strictEqual(result, false);
      });
    });

    describe('NEWRELEASE15 code', () => {
      it('should apply 15% for new releases', () => {
        const result = pricing.applyPromotion(100, 'NEWRELEASE15', { isNew: true });
        assert.strictEqual(result, true);
      });

      it('should not apply for old items', () => {
        const result = pricing.applyPromotion(100, 'NEWRELEASE15', { isNew: false });
        assert.strictEqual(result, false);
      });
    });

    describe('FICTION25 code', () => {
      it('should apply 25% for fiction category', () => {
        const result = pricing.applyPromotion(100, 'FICTION25', { category: 'fiction' });
        assert.strictEqual(result, true);
      });

      it('should not apply for other categories', () => {
        const result = pricing.applyPromotion(100, 'FICTION25', { category: 'nonfiction' });
        assert.strictEqual(result, false);
      });
    });

    describe('invalid inputs', () => {
      it('should return false for invalid code', () => {
        const result = pricing.applyPromotion(100, 'INVALID', {});
        assert.strictEqual(result, false);
      });

      it('should return false for empty code', () => {
        const result = pricing.applyPromotion(100, '', {});
        assert.strictEqual(result, false);
      });

      it('should return false for null code', () => {
        const result = pricing.applyPromotion(100, null, {});
        assert.strictEqual(result, false);
      });

      it('should return object with promoApplied false for negative price', () => {
        const result = pricing.applyPromotion(-100, 'WELCOME10', {});
        assert.strictEqual(result.promoApplied, false);
      });
    });
  });

  describe('applyPromotionDetailed', () => {
    it('should return detailed pricing for WELCOME10', () => {
      const result = pricing.applyPromotionDetailed(100, 'WELCOME10', {});
      assert.strictEqual(result.originalPrice, 100);
      assert.strictEqual(result.finalPrice, 90);
      assert.strictEqual(result.discount, 10);
      assert.strictEqual(result.promoApplied, true);
    });

    it('should verify discount arithmetic for WELCOME10', () => {
      const result = pricing.applyPromotionDetailed(200, 'WELCOME10', {});
      assert.strictEqual(result.discount, 20);
      assert.strictEqual(result.finalPrice, 180);
    });

    it('should apply SAVE20 correctly', () => {
      const result = pricing.applyPromotionDetailed(100, 'SAVE20', {});
      assert.strictEqual(result.discount, 20);
      assert.strictEqual(result.finalPrice, 80);
    });

    it('should apply CLEARANCE30 correctly', () => {
      const result = pricing.applyPromotionDetailed(100, 'CLEARANCE30', { isClearance: true });
      assert.strictEqual(result.discount, 30);
      assert.strictEqual(result.finalPrice, 70);
    });

    it('should apply NEWRELEASE15 correctly', () => {
      const result = pricing.applyPromotionDetailed(100, 'NEWRELEASE15', { isNew: true });
      assert.strictEqual(result.discount, 15);
      assert.strictEqual(result.finalPrice, 85);
    });

    it('should apply FICTION25 correctly', () => {
      const result = pricing.applyPromotionDetailed(100, 'FICTION25', { category: 'fiction' });
      assert.strictEqual(result.discount, 25);
      assert.strictEqual(result.finalPrice, 75);
    });

    it('should handle code with spaces', () => {
      const result = pricing.applyPromotionDetailed(100, '  WELCOME10  ', {});
      assert.strictEqual(result.promoApplied, true);
    });

    it('should return no discount for invalid code', () => {
      const result = pricing.applyPromotionDetailed(100, 'INVALID', {});
      assert.strictEqual(result.originalPrice, 100);
      assert.strictEqual(result.finalPrice, 100);
      assert.strictEqual(result.discount, 0);
      assert.strictEqual(result.promoApplied, false);
    });

    it('should return zeros for invalid price', () => {
      const result = pricing.applyPromotionDetailed(-100, 'WELCOME10', {});
      assert.strictEqual(result.originalPrice, 0);
      assert.strictEqual(result.finalPrice, 0);
      assert.strictEqual(result.discount, 0);
      assert.strictEqual(result.promoApplied, false);
    });

    it('should return zeros for zero price', () => {
      const result = pricing.applyPromotionDetailed(0, 'WELCOME10', {});
      assert.strictEqual(result.originalPrice, 0);
    });
  });

  describe('calculateFinalTotal', () => {
    it('should calculate total with all adjustments', () => {
      const result = pricing.calculateFinalTotal(100, {
        discount: 10,
        shipping: 5,
        tax: 8
      }, 0);
      assert.strictEqual(result, 103); // 100 - 10 + 5 + 8
    });

    it('should handle zero discount', () => {
      const result = pricing.calculateFinalTotal(100, {
        discount: 0,
        shipping: 5,
        tax: 8
      }, 0);
      assert.strictEqual(result, 113);
    });

    it('should handle gift wrap cost', () => {
      const result = pricing.calculateFinalTotal(100, {
        discount: 10,
        shipping: 5,
        tax: 8
      }, 5);
      assert.strictEqual(result, 108);
    });

    it('should prevent negative total', () => {
      const result = pricing.calculateFinalTotal(50, {
        discount: 100,
        shipping: 5,
        tax: 8
      }, 0);
      assert.strictEqual(result, 13); // 0 + 5 + 8
    });

    it('should handle exactly zero total after discount', () => {
      const result = pricing.calculateFinalTotal(50, {
        discount: 50,
        shipping: 0,
        tax: 0
      }, 0);
      assert.strictEqual(result, 0);
    });

    it('should prevent negative even with 1 over discount', () => {
      const result = pricing.calculateFinalTotal(50, {
        discount: 51,
        shipping: 5,
        tax: 8
      }, 0);
      assert.strictEqual(result, 13);
    });

    it('should handle missing adjustments', () => {
      const result = pricing.calculateFinalTotal(100, {}, 0);
      assert.strictEqual(result, 100);
    });

    it('should handle partial adjustments', () => {
      const result = pricing.calculateFinalTotal(100, { discount: 10 }, 0);
      assert.strictEqual(result, 90);
    });

    describe('invalid inputs', () => {
      it('should return 0 for negative subtotal', () => {
        const result = pricing.calculateFinalTotal(-100, {}, 0);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for non-number subtotal', () => {
        const result = pricing.calculateFinalTotal('100', {}, 0);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative discount', () => {
        const result = pricing.calculateFinalTotal(100, { discount: -10 }, 0);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative shipping', () => {
        const result = pricing.calculateFinalTotal(100, { shipping: -5 }, 0);
        assert.strictEqual(result, 0);
      });

      it('should return 0 for negative tax', () => {
        const result = pricing.calculateFinalTotal(100, { tax: -8 }, 0);
        assert.strictEqual(result, 0);
      });

      it('should set negative giftWrap to 0', () => {
        const result = pricing.calculateFinalTotal(100, {}, -5);
        assert.strictEqual(result, 100);
      });
    });
  });
});
