/**
 * Product Model - Unit Tests
 * Comprehensive tests to kill mutants in product.js
 */

import { describe, it, before } from 'mocha';
import assert from 'assert';
import { Product } from '../../src/models/product.js';

describe('Product Model - Unit Tests', () => {
  
  describe('constructor', () => {
    it('should create product with all properties', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10, 'Description');
      
      assert.strictEqual(product.id, 'p1');
      assert.strictEqual(product.title, 'Book');
      assert.strictEqual(product.author, 'Author');
      assert.strictEqual(product.price, 19.99);
      assert.strictEqual(product.category, 'Fiction');
      assert.strictEqual(product.isbn, '1234567890');
      assert.strictEqual(product.stock, 10);
      assert.strictEqual(product.description, 'Description');
      assert.ok(product.createdAt instanceof Date);
    });

    it('should create product without description', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.description, '');
    });
  });

  describe('isInStock', () => {
    it('should return true when stock is positive', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 5);
      assert.strictEqual(product.isInStock(), true);
    });

    it('should return false when stock is zero', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 0);
      assert.strictEqual(product.isInStock(), false);
    });

    it('should return false when stock is negative', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', -1);
      assert.strictEqual(product.isInStock(), false);
    });

    it('should return true for stock of 1 (boundary)', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 1);
      assert.strictEqual(product.isInStock(), true);
    });
  });

  describe('isLowStock', () => {
    it('should return true when stock is below default threshold', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 3);
      assert.strictEqual(product.isLowStock(), true);
    });

    it('should return false when stock is above threshold', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.isLowStock(), false);
    });

    it('should return false when stock is zero', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 0);
      assert.strictEqual(product.isLowStock(), false);
    });

    it('should return true when stock equals threshold (boundary)', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 5);
      assert.strictEqual(product.isLowStock(5), true);
    });

    it('should return false when stock is one above threshold', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 6);
      assert.strictEqual(product.isLowStock(5), false);
    });

    it('should handle custom threshold', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 8);
      assert.strictEqual(product.isLowStock(10), true);
    });

    it('should handle negative threshold by converting to zero', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 1);
      assert.strictEqual(product.isLowStock(-5), false);
    });

    it('should return true for stock of 1 with default threshold', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 1);
      assert.strictEqual(product.isLowStock(), true);
    });
  });

  describe('hasSufficientStock', () => {
    it('should return true when stock is sufficient', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.hasSufficientStock(5), true);
    });

    it('should return false when stock is insufficient', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 3);
      assert.strictEqual(product.hasSufficientStock(5), false);
    });

    it('should return true when quantity equals stock (boundary)', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 5);
      assert.strictEqual(product.hasSufficientStock(5), true);
    });

    it('should return false when quantity is one more than stock', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 5);
      assert.strictEqual(product.hasSufficientStock(6), false);
    });

    it('should return false for negative quantity', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.hasSufficientStock(-1), false);
    });

    it('should return false for non-number quantity', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.hasSufficientStock('5'), false);
    });

    it('should return true for zero quantity', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.hasSufficientStock(0), true);
    });
  });

  describe('isDiscountEligible', () => {
    it('should return true for fiction >= $50', () => {
      const product = new Product('p1', 'Book', 'Author', 50.00, 'fiction', '1234567890', 10);
      assert.strictEqual(product.isDiscountEligible(), true);
    });

    it('should return false for fiction < $50', () => {
      const product = new Product('p1', 'Book', 'Author', 49.99, 'fiction', '1234567890', 10);
      assert.strictEqual(product.isDiscountEligible(), false);
    });

    it('should return true for any category >= $100', () => {
      const product = new Product('p1', 'Book', 'Author', 100.00, 'Other', '1234567890', 10);
      assert.strictEqual(product.isDiscountEligible(), true);
    });

    it('should return false for non-discount category < $100', () => {
      const product = new Product('p1', 'Book', 'Author', 75.00, 'Other', '1234567890', 10);
      assert.strictEqual(product.isDiscountEligible(), false);
    });

    it('should handle case-insensitive categories', () => {
      const product = new Product('p1', 'Book', 'Author', 50.00, 'FICTION', '1234567890', 10);
      assert.strictEqual(product.isDiscountEligible(), true);
    });
  });

  describe('getDisplayPrice', () => {
    it('should return price with 0% markup', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.getDisplayPrice(), 19.99);
    });

    it('should apply positive markup correctly', () => {
      const product = new Product('p1', 'Book', 'Author', 20.00, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.getDisplayPrice(10), 22.00);
    });

    it('should clamp negative markup to 0', () => {
      const product = new Product('p1', 'Book', 'Author', 20.00, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.getDisplayPrice(-10), 20.00);
    });

    it('should clamp markup > 100 to 100', () => {
      const product = new Product('p1', 'Book', 'Author', 20.00, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.getDisplayPrice(150), 40.00);
    });

    it('should round to 2 decimal places', () => {
      const product = new Product('p1', 'Book', 'Author', 19.999, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.getDisplayPrice(0), 20.00);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock when quantity is valid', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      const result = product.reduceStock(5);
      assert.strictEqual(result, true);
      assert.strictEqual(product.stock, 5);
    });

    it('should return false when quantity exceeds stock', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      const result = product.reduceStock(15);
      assert.strictEqual(result, false);
      assert.strictEqual(product.stock, 10);
    });

    it('should return false for zero or negative quantity', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.reduceStock(0), false);
      assert.strictEqual(product.reduceStock(-5), false);
    });

    it('should allow stock to reach exactly zero', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      const result = product.reduceStock(10);
      assert.strictEqual(result, true);
      assert.strictEqual(product.stock, 0);
    });
  });

  describe('increaseStock', () => {
    it('should increase stock when quantity is positive', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      const result = product.increaseStock(5);
      assert.strictEqual(result, true);
      assert.strictEqual(product.stock, 15);
    });

    it('should return false for zero or negative quantity', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10);
      assert.strictEqual(product.increaseStock(0), false);
      assert.strictEqual(product.increaseStock(-5), false);
    });
  });

  describe('toJSON', () => {
    it('should serialize product to JSON object', () => {
      const product = new Product('p1', 'Book', 'Author', 19.99, 'Fiction', '1234567890', 10, 'Desc');
      const json = product.toJSON();
      
      assert.strictEqual(json.id, 'p1');
      assert.strictEqual(json.title, 'Book');
      assert.strictEqual(json.author, 'Author');
      assert.strictEqual(json.price, 19.99);
      assert.strictEqual(json.category, 'Fiction');
      assert.strictEqual(json.isbn, '1234567890');
      assert.strictEqual(json.stock, 10);
      assert.strictEqual(json.description, 'Desc');
    });
  });

  describe('fromJSON', () => {
    it('should create Product from JSON object', () => {
      const json = {
        id: 'p1',
        title: 'Book',
        author: 'Author',
        price: 19.99,
        category: 'Fiction',
        isbn: '1234567890',
        stock: 10,
        description: 'Desc'
      };
      const product = Product.fromJSON(json);
      
      assert.ok(product instanceof Product);
      assert.strictEqual(product.id, 'p1');
      assert.strictEqual(product.title, 'Book');
      assert.strictEqual(product.price, 19.99);
    });
  });
});
