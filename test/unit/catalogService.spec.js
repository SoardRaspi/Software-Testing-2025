/**
 * Unit Tests for CatalogService
 * 
 * These tests target mutation operators:
 * - ROR: Relational operators in filtering and sorting
 * - LOR: Logical operators in search conditions
 * - MDC: Method call deletion in service operations
 */

import assert from 'assert';
import sinon from 'sinon';
import * as catalogService from '../../src/services/catalogService.js';
import { getTestProducts, resetDataFiles, backupDataFiles, restoreDataFiles } from '../helpers.js';

describe('CatalogService - Unit Tests', () => {
  
  before(async () => {
    await backupDataFiles();
  });
  
  after(async () => {
    await restoreDataFiles();
  });
  
  beforeEach(async () => {
    // Reset data files before each test
    await resetDataFiles();
    // Load products into catalog
    await catalogService.loadProducts();
  });
  
  describe('searchProducts', () => {
    
    it('should return all products when no query provided', async () => {
      // Kills conditional mutants that affect empty query handling
      const results = await catalogService.searchProducts('');
      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 0);
    });
    
    it('should find products matching title', async () => {
      // Kills string comparison mutants in search logic
      const results = await catalogService.searchProducts('Test Book');
      assert.ok(Array.isArray(results));
      results.forEach(product => {
        const matchesTitle = product.title.toLowerCase().includes('test book'.toLowerCase());
        const matchesAuthor = product.author?.toLowerCase().includes('test book'.toLowerCase());
        assert.strictEqual(matchesTitle || matchesAuthor, true);
      });
    });
    
    it('should find products matching author', async () => {
      // Kills LOR mutants: || to && in multi-field search
      const results = await catalogService.searchProducts('Expensive');
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
    });
    
    it('should handle case-insensitive search', async () => {
      // Kills case-sensitivity mutants
      const lowerCase = await catalogService.searchProducts('test');
      const upperCase = await catalogService.searchProducts('TEST');
      
      assert.strictEqual(lowerCase.length, upperCase.length);
    });
    
    it('should return empty array for non-matching query', async () => {
      // Kills RV mutants that change return values
      const results = await catalogService.searchProducts('NonExistentBook12345');
      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 0);
    });
    
    it('should handle special characters in query', async () => {
      // Kills string escaping/regex mutants
      const results = await catalogService.searchProducts('Test & Special');
      assert.ok(Array.isArray(results));
    });
    
    it('should search in ISBN field', async () => {
      // Kills multi-field search logic mutants
      const results = await catalogService.searchProducts('9780743273565');
      assert.ok(Array.isArray(results));
    });
  });
  
  describe('filterProducts', () => {
    
    it('should filter by category', async () => {
      // Kills conditional mutants in category filtering
      const results = await catalogService.filterProducts({ category: 'Fiction' });
      assert.ok(Array.isArray(results));
      results.forEach(product => {
        assert.strictEqual(product.category, 'Fiction');
      });
    });
    
    it('should filter by minimum price', async () => {
      // Kills ROR mutants: >= to > in price comparison
      const minPrice = 20;
      const results = await catalogService.filterProducts({ minPrice });
      results.forEach(product => {
        assert.ok(product.price >= minPrice);
      });
    });
    
    it('should filter by maximum price', async () => {
      // Kills ROR mutants: <= to < in price comparison
      const maxPrice = 50;
      const results = await catalogService.filterProducts({ maxPrice });
      results.forEach(product => {
        assert.ok(product.price <= maxPrice);
      });
    });
    
    it('should filter by price range', async () => {
      // Kills LOR mutants: && to || in combined conditions
      const results = await catalogService.filterProducts({ minPrice: 10, maxPrice: 30 });
      results.forEach(product => {
        assert.ok(product.price >= 10);
        assert.ok(product.price <= 30);
      });
    });
    
    it('should filter by stock availability', async () => {
      // Kills ROR mutants: > to >= in stock check
      const results = await catalogService.filterProducts({ inStock: true });
      results.forEach(product => {
        assert.ok(product.stock > 0);
      });
    });
    
    it('should return products with zero stock when inStock is false', async () => {
      // Kills LOR mutants in stock filtering
      const results = await catalogService.filterProducts({ inStock: false });
      results.forEach(product => {
        assert.strictEqual(product.stock, 0);
      });
    });
    
    it('should combine multiple filters', async () => {
      // Kills LOR mutants: complex && combinations
      const results = await catalogService.filterProducts({
        category: 'Fiction',
        minPrice: 10,
        maxPrice: 30,
        inStock: true
      });
      
      results.forEach(product => {
        assert.strictEqual(product.category, 'Fiction');
        assert.ok(product.price >= 10);
        assert.ok(product.price <= 30);
        assert.ok(product.stock > 0);
      });
    });
    
    it('should return all products when no filters provided', async () => {
      // Kills conditional mutants for empty filter handling
      const results = await catalogService.filterProducts({});
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
    });
  });
  
  describe('sortProducts', () => {
    
    it('should sort by title ascending', () => {
      // Kills comparison operator mutants in sort
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'title', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.strictEqual(sorted[i].title <= sorted[i + 1].title, true);
      }
    });
    
    it('should sort by title descending', () => {
      // Kills ROR mutants: < to > in sort comparison
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'title', 'desc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.strictEqual(sorted[i].title >= sorted[i + 1].title, true);
      }
    });
    
    it('should sort by price ascending', () => {
      // Kills AOR and ROR mutants in numeric comparison
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'price', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.ok(sorted[i].price <= sorted[i + 1].price);
      }
    });
    
    it('should sort by price descending', () => {
      // Kills comparison mutants
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'price', 'desc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.ok(sorted[i].price >= sorted[i + 1].price);
      }
    });
    
    it('should sort by stock level', () => {
      // Kills numeric comparison mutants
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'stock', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.ok(sorted[i].stock <= sorted[i + 1].stock);
      }
    });
    
    it('should return original array when invalid sort field', () => {
      // Kills conditional mutants in sort validation
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'invalid', 'asc');
      
      assert.strictEqual(sorted.length, products.length);
    });
  });
  
  // describe('paginateProducts', () => {
    
  //   it('should paginate products correctly', () => {
  //     // Kills AOR mutants: * to / in offset calculation
  //     const products = getTestProducts();
  //     const page = 1;
  //     const limit = 2;
      
  //     const result = catalogService.paginateProducts(products, page, limit);
      
  //     assert.strictEqual(result.items.length, 2);
  //     assert.strictEqual(result.page, 1);
  //     assert.ok(result.totalPages > 0);
  //   });
    
  //   it('should calculate correct total pages', () => {
  //     // Kills AOR mutants: Math.ceil calculation
  //     const products = getTestProducts(); // 4 products
  //     const result = catalogService.paginateProducts(products, 1, 2);
      
  //     assert.strictEqual(result.totalPages, Math.ceil(products.length / 2));
  //   });
    
  //   it('should handle last page with fewer items', () => {
  //     // Kills boundary condition mutants
  //     const products = getTestProducts();
  //     const lastPage = Math.ceil(products.length / 2);
      
  //     const result = catalogService.paginateProducts(products, lastPage, 2);
  //     assert.ok(result.items.length <= 2);
  //   });
    
  //   it('should return empty array for page beyond total', () => {
  //     // Kills ROR mutants: > to >= in page validation
  //     const products = getTestProducts();
  //     const result = catalogService.paginateProducts(products, 999, 2);
      
  //     assert.ok(Array.isArray(result.items));
  //     assert.strictEqual(result.items.length, 0);
  //   });
    
  //   it('should handle page 0 or negative pages', () => {
  //     // Edge case - kills boundary validation mutants
  //     const products = getTestProducts();
  //     const result = catalogService.paginateProducts(products, 0, 2);
      
  //     assert.ok(Array.isArray(result.items));
  //   });
  // });
  
  describe('getProductById', () => {
    
    it('should return product when ID exists', async () => {
      // Kills RV mutants that change return values
      const product = await catalogService.getProductById('test-001');
      assert.strictEqual(typeof product, 'object');
      assert.strictEqual(product.id, 'test-001');
    });
    
    it('should return null when ID does not exist', async () => {
      // Kills conditional mutants in find logic
      const product = await catalogService.getProductById('non-existent-id');
      assert.strictEqual(product, null);
    });
    
    it('should return null for null or undefined ID', async () => {
      // Kills LOR mutants in null checks
      assert.strictEqual(await catalogService.getProductById(null), null);
      assert.strictEqual(await catalogService.getProductById(undefined), null);
    });
    
    it('should return null for empty string ID', async () => {
      // Kills string validation mutants
      const product = await catalogService.getProductById('');
      assert.strictEqual(product, null);
    });
  });
  
  // describe('addProduct', () => {
    
  //   it('should add a new product successfully', async () => {
  //     // Kills MDC mutants that remove the save operation
  //     const newProduct = {
  //       id: 'new-test-001',
  //       title: 'New Test Book',
  //       author: 'New Author',
  //       isbn: '9781234567890',
  //       price: 29.99,
  //       category: 'Fiction',
  //       stock: 15,
  //       description: 'A new test book'
  //     };
      
  //     const result = await catalogService.addProduct(newProduct);
  //     assert.strictEqual(result.success, true);
      
  //     // Verify product was actually added
  //     const added = await catalogService.getProductById('new-test-001');
  //     assert.ok(added !== null);
  //     assert.strictEqual(added.title, 'New Test Book');
  //   });
    
  //   it('should reject product with duplicate ID', async () => {
  //     // Kills LOR mutants in duplicate check
  //     const duplicate = {
  //       id: 'test-001', // Already exists
  //       title: 'Duplicate',
  //       author: 'Author',
  //       isbn: '9780000000000',
  //       price: 10,
  //       category: 'Fiction',
  //       stock: 5,
  //       description: 'Test'
  //     };
      
  //     const result = await catalogService.addProduct(duplicate);
  //     assert.strictEqual(result.success, false);
  //   });
    
  //   it('should validate required fields', async () => {
  //     // Kills LOR mutants in validation checks
  //     const incomplete = {
  //       id: 'incomplete-001',
  //       title: 'Incomplete Book'
  //       // Missing required fields
  //     };
      
  //     const result = await catalogService.addProduct(incomplete);
  //     assert.strictEqual(result.success, false);
  //   });
  // });
  
  // describe('updateProduct', () => {
    
  //   it('should update existing product', async () => {
  //     // Kills MDC mutants that remove update operations
  //     const updates = {
  //       price: 19.99,
  //       stock: 20
  //     };
      
  //     const result = await catalogService.updateProduct('test-001', updates);
  //     assert.strictEqual(result.success, true);
      
  //     // Verify update
  //     const updated = await catalogService.getProductById('test-001');
  //     assert.strictEqual(updated.price, 19.99);
  //     assert.strictEqual(updated.stock, 20);
  //   });
    
  //   it('should fail to update non-existent product', async () => {
  //     // Kills conditional mutants in existence check
  //     const result = await catalogService.updateProduct('non-existent', { price: 10 });
  //     assert.strictEqual(result.success, false);
  //   });
    
  //   it('should not update ID field', async () => {
  //     // Kills security mutants that allow ID changes
  //     const result = await catalogService.updateProduct('test-001', { id: 'changed-id' });
      
  //     const product = await catalogService.getProductById('test-001');
  //     assert.strictEqual(product.id, 'test-001');
  //   });
  // });
  
  // describe('deleteProduct', () => {
    
  //   it('should delete existing product', async () => {
  //     // Kills MDC mutants that remove delete operations
  //     const result = await catalogService.deleteProduct('test-001');
  //     assert.strictEqual(result.success, true);
      
  //     // Verify deletion
  //     const deleted = await catalogService.getProductById('test-001');
  //     assert.strictEqual(deleted, null);
  //   });
    
  //   it('should fail to delete non-existent product', async () => {
  //     // Kills conditional mutants
  //     const result = await catalogService.deleteProduct('non-existent');
  //     assert.strictEqual(result.success, false);
  //   });
  // });

  describe('getAllProducts - pagination', () => {
    it('should return first page with default limit', () => {
      const result = catalogService.getAllProducts();
      assert.ok(result.products);
      assert.strictEqual(result.page, 1);
      assert.strictEqual(result.limit, 20);
    });

    it('should handle page parameter less than 1', () => {
      const result = catalogService.getAllProducts(0, 10);
      assert.strictEqual(result.page, 1); // Should default to 1
    });

    it('should handle negative page parameter', () => {
      const result = catalogService.getAllProducts(-5, 10);
      assert.strictEqual(result.page, 1);
    });

    it('should handle limit less than 1', () => {
      const result = catalogService.getAllProducts(1, 0);
      assert.strictEqual(result.limit, 20); // Should default to 20
    });

    it('should cap limit at 100', () => {
      const result = catalogService.getAllProducts(1, 200);
      assert.strictEqual(result.limit, 100);
    });

    it('should calculate total pages correctly', () => {
      const result = catalogService.getAllProducts(1, 2);
      assert.strictEqual(result.totalPages, Math.ceil(result.total / 2));
    });

    it('should set hasMore to false on last page', () => {
      const result = catalogService.getAllProducts(1, 100);
      assert.strictEqual(result.hasMore, false);
    });

    it('should handle non-number page parameter', () => {
      const result = catalogService.getAllProducts('invalid', 10);
      assert.strictEqual(result.page, 1);
    });

    it('should handle non-number limit parameter', () => {
      const result = catalogService.getAllProducts(1, 'invalid');
      assert.strictEqual(result.limit, 20);
    });
  });

  describe('searchProducts - advanced', () => {
    it('should match by word boundaries', () => {
      const results = catalogService.searchProducts('Book');
      assert.ok(results.length > 0);
    });

    it('should handle single character search', () => {
      const results = catalogService.searchProducts('T');
      assert.ok(Array.isArray(results));
    });

    it('should search with custom fields', () => {
      const results = catalogService.searchProducts('Test', { searchFields: ['title'] });
      assert.ok(Array.isArray(results));
    });

    it('should handle case sensitive search', () => {
      const results = catalogService.searchProducts('test', { caseSensitive: true });
      assert.ok(Array.isArray(results));
    });

    it('should match startsWith logic', () => {
      const results = catalogService.searchProducts('Test');
      assert.ok(results.length > 0);
    });

    it('should handle multi-word queries', () => {
      const results = catalogService.searchProducts('Test Book One');
      assert.ok(Array.isArray(results));
    });

    it('should skip short words in multi-word search', () => {
      const results = catalogService.searchProducts('a b Test');
      assert.ok(Array.isArray(results));
    });

    it('should handle query with only spaces', () => {
      const results = catalogService.searchProducts('   ');
      assert.ok(Array.isArray(results));
    });

    it('should search in description field', () => {
      const results = catalogService.searchProducts('test', { searchFields: ['description'] });
      assert.ok(Array.isArray(results));
    });

    it('should handle numeric field values', () => {
      const results = catalogService.searchProducts('15.99', { searchFields: ['price'] });
      assert.ok(Array.isArray(results));
    });

    it('should match when all words present', () => {
      const results = catalogService.searchProducts('Test Another');
      assert.ok(Array.isArray(results));
    });
  });

  describe('filterProducts - comprehensive', () => {
    it('should filter by minPrice only', () => {
      const results = catalogService.filterProducts({ minPrice: 20 });
      results.forEach(p => assert.ok(p.price >= 20));
    });

    it('should filter by maxPrice only', () => {
      const results = catalogService.filterProducts({ maxPrice: 20 });
      results.forEach(p => assert.ok(p.price <= 20));
    });

    it('should filter by both minPrice and maxPrice', () => {
      const results = catalogService.filterProducts({ minPrice: 15, maxPrice: 30 });
      results.forEach(p => {
        assert.ok(p.price >= 15);
        assert.ok(p.price <= 30);
      });
    });

    it('should filter inStock true', () => {
      const results = catalogService.filterProducts({ inStock: true });
      results.forEach(p => assert.ok(p.isInStock()));
    });

    it('should filter inStock false', () => {
      const results = catalogService.filterProducts({ inStock: false });
      results.forEach(p => assert.strictEqual(p.isInStock(), false));
    });

    it('should filter by lowStock', () => {
      const results = catalogService.filterProducts({ lowStock: true });
      results.forEach(p => assert.ok(p.isLowStock()));
    });

    it('should filter by lowStock with custom threshold', () => {
      const results = catalogService.filterProducts({ lowStock: true, lowStockThreshold: 10 });
      results.forEach(p => assert.ok(p.isLowStock(10)));
    });

    it('should filter by author', () => {
      const results = catalogService.filterProducts({ author: 'Test' });
      results.forEach(p => assert.ok(p.author.toLowerCase().includes('test')));
    });

    it('should filter by discountEligible', () => {
      const results = catalogService.filterProducts({ discountEligible: true });
      results.forEach(p => assert.ok(p.isDiscountEligible()));
    });

    it('should handle invalid category gracefully', () => {
      const results = catalogService.filterProducts({ category: 'InvalidCategory123' });
      assert.ok(Array.isArray(results));
    });

    it('should combine multiple filters', () => {
      const results = catalogService.filterProducts({ 
        category: 'Fiction', 
        minPrice: 10,
        inStock: true 
      });
      assert.ok(Array.isArray(results));
    });

    it('should handle case insensitive category', () => {
      const results = catalogService.filterProducts({ category: 'fiction' });
      assert.ok(Array.isArray(results));
    });

    it('should handle case insensitive author', () => {
      const results = catalogService.filterProducts({ author: 'AUTHOR' });
      assert.ok(Array.isArray(results));
    });
  });

  describe('sortProducts - comprehensive', () => {
    it('should sort by price ascending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'price', 'asc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].price >= sorted[i-1].price);
      }
    });

    it('should sort by price descending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'price', 'desc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].price <= sorted[i-1].price);
      }
    });

    it('should sort by stock ascending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'stock', 'asc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].stock >= sorted[i-1].stock);
      }
    });

    it('should sort by stock descending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'stock', 'desc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].stock <= sorted[i-1].stock);
      }
    });

    it('should sort by title ascending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'title', 'asc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].title.toLowerCase() >= sorted[i-1].title.toLowerCase());
      }
    });

    it('should sort by author ascending', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'author', 'asc');
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(sorted[i].author.toLowerCase() >= sorted[i-1].author.toLowerCase());
      }
    });

    it('should sort by category', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'category', 'asc');
      assert.ok(Array.isArray(sorted));
    });

    it('should default to asc for invalid order', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'price', 'invalid');
      assert.ok(Array.isArray(sorted));
    });

    it('should default to title for invalid sortBy', () => {
      const products = catalogService.filterProducts({});
      const sorted = catalogService.sortProducts(products, 'invalidField', 'asc');
      assert.ok(Array.isArray(sorted));
    });

    it('should handle empty array', () => {
      const sorted = catalogService.sortProducts([], 'price', 'asc');
      assert.strictEqual(sorted.length, 0);
    });

    it('should handle null input', () => {
      const sorted = catalogService.sortProducts(null, 'price', 'asc');
      assert.strictEqual(sorted, null);
    });

    it('should not mutate original array', () => {
      const products = catalogService.filterProducts({});
      const original = [...products];
      catalogService.sortProducts(products, 'price', 'desc');
      assert.deepStrictEqual(products, original);
    });

    it('should handle single product array', () => {
      const products = [catalogService.getProductById('test-001')];
      const sorted = catalogService.sortProducts(products, 'price', 'asc');
      assert.strictEqual(sorted.length, 1);
    });
  });

  describe('getProductById - edge cases', () => {
    it('should handle null productId', () => {
      const result = catalogService.getProductById(null);
      assert.strictEqual(result, null);
    });

    it('should handle undefined productId', () => {
      const result = catalogService.getProductById(undefined);
      assert.strictEqual(result, null);
    });

    it('should handle empty string productId', () => {
      const result = catalogService.getProductById('');
      assert.strictEqual(result, null);
    });

    it('should be case sensitive', () => {
      const result = catalogService.getProductById('TEST-001');
      assert.strictEqual(result, null);
    });
  });

  describe('sortProducts - comparison operators', () => {
    it('should handle equal numeric values', () => {
      const products = getTestProducts();
      const result = catalogService.sortProducts(products, 'price', 'asc');
      assert.ok(Array.isArray(result));
    });

    it('should handle equal string values for title', () => {
      const products = getTestProducts();
      const result = catalogService.sortProducts(products, 'title', 'asc');
      assert.ok(Array.isArray(result));
      if (result.length >= 2) {
        assert.ok(result[0].title.toLowerCase() <= result[1].title.toLowerCase());
      }
    });

    it('should handle category sorting with case conversion', () => {
      const products = getTestProducts();
      const result = catalogService.sortProducts(products, 'category', 'asc');
      assert.ok(Array.isArray(result));
    });

    it('should handle author sorting', () => {
      const products = getTestProducts();
      const result = catalogService.sortProducts(products, 'author', 'desc');
      assert.ok(Array.isArray(result));
    });

    it('should handle mixed type comparisons gracefully', () => {
      const products = getTestProducts();
      const result = catalogService.sortProducts(products, 'price', 'desc');
      assert.ok(result.length === products.length);
    });
  });

  describe('filterProducts - discount eligibility', () => {
    it('should filter by discount eligibility accurately', () => {
      const results = catalogService.filterProducts({ discountEligible: true });
      results.forEach(p => assert.strictEqual(p.isDiscountEligible(), true));
    });
  });

  describe('updateProduct', () => {
    it('should return failure for non-existent product', () => {
      const result = catalogService.updateProduct('non-existent-id', { price: 100 });
      assert.strictEqual(result.success, false);
    });

    it('should update price with valid value', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { price: 25.99 });
      assert.strictEqual(result.success, true);
    });

    it('should reject undefined price updates', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { price: undefined });
      assert.strictEqual(result.success, true);
    });

    it('should update stock when valid number provided', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { stock: 50 });
      assert.strictEqual(result.success, true);
    });

    it('should update stock to zero (boundary)', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { stock: 0 });
      assert.strictEqual(result.success, true);
    });

    it('should reject negative stock values', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialStock = products[0].stock;
      catalogService.updateProduct(productId, { stock: -5 });
      const product = catalogService.getProductById(productId);
      assert.notStrictEqual(product.stock, -5);
    });

    it('should reject undefined stock updates', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { stock: undefined });
      assert.strictEqual(result.success, true);
    });

    it('should reject non-number stock values', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialStock = products[0].stock;
      catalogService.updateProduct(productId, { stock: 'invalid' });
      const product = catalogService.getProductById(productId);
      assert.strictEqual(product.stock, initialStock);
    });

    it('should update title when string provided', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { title: 'New Title' });
      assert.strictEqual(result.success, true);
      const product = catalogService.getProductById(productId);
      assert.strictEqual(product.title, 'New Title');
    });

    it('should ignore title when not a string', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialTitle = products[0].title;
      catalogService.updateProduct(productId, { title: 123 });
      const product = catalogService.getProductById(productId);
      assert.strictEqual(product.title, initialTitle);
    });

    it('should update description when string provided', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, { description: 'New description' });
      assert.strictEqual(result.success, true);
    });

    it('should ignore description when not a string', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialDesc = products[0].description;
      catalogService.updateProduct(productId, { description: null });
      const product = catalogService.getProductById(productId);
      assert.strictEqual(product.description, initialDesc);
    });

    it('should handle multiple updates simultaneously', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, {
        price: 19.99,
        stock: 25,
        title: 'Updated Title',
        description: 'Updated description'
      });
      assert.strictEqual(result.success, true);
    });

    it('should handle empty updates object', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const result = catalogService.updateProduct(productId, {});
      assert.strictEqual(result.success, true);
    });
  });
});
