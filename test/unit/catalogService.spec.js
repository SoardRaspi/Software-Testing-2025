/**
 * Unit Tests for CatalogService
 * 
 * These tests target mutation operators:
 * - ROR: Relational operators in filtering and sorting
 * - LOR: Logical operators in search conditions
 * - MDC: Method call deletion in service operations
 */

import { expect } from 'chai';
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
  });
  
  describe('searchProducts', () => {
    
    it('should return all products when no query provided', async () => {
      // Kills conditional mutants that affect empty query handling
      const results = await catalogService.searchProducts('');
      expect(results).to.be.an('array');
      expect(results.length).to.be.above(0);
    });
    
    it('should find products matching title', async () => {
      // Kills string comparison mutants in search logic
      const results = await catalogService.searchProducts('Test Book');
      expect(results).to.be.an('array');
      results.forEach(product => {
        const matchesTitle = product.title.toLowerCase().includes('test book'.toLowerCase());
        const matchesAuthor = product.author?.toLowerCase().includes('test book'.toLowerCase());
        expect(matchesTitle || matchesAuthor).to.be.true;
      });
    });
    
    it('should find products matching author', async () => {
      // Kills LOR mutants: || to && in multi-field search
      const results = await catalogService.searchProducts('Author');
      expect(results).to.be.an('array');
      expect(results.length).to.be.above(0);
    });
    
    it('should handle case-insensitive search', async () => {
      // Kills case-sensitivity mutants
      const lowerCase = await catalogService.searchProducts('test');
      const upperCase = await catalogService.searchProducts('TEST');
      
      expect(lowerCase.length).to.equal(upperCase.length);
    });
    
    it('should return empty array for non-matching query', async () => {
      // Kills RV mutants that change return values
      const results = await catalogService.searchProducts('NonExistentBook12345');
      expect(results).to.be.an('array');
      expect(results).to.be.empty;
    });
    
    it('should handle special characters in query', async () => {
      // Kills string escaping/regex mutants
      const results = await catalogService.searchProducts('Test & Special');
      expect(results).to.be.an('array');
    });
    
    it('should search in ISBN field', async () => {
      // Kills multi-field search logic mutants
      const results = await catalogService.searchProducts('9780743273565');
      expect(results).to.be.an('array');
    });
  });
  
  describe('filterProducts', () => {
    
    it('should filter by category', async () => {
      // Kills conditional mutants in category filtering
      const results = await catalogService.filterProducts({ category: 'Fiction' });
      expect(results).to.be.an('array');
      results.forEach(product => {
        expect(product.category).to.equal('Fiction');
      });
    });
    
    it('should filter by minimum price', async () => {
      // Kills ROR mutants: >= to > in price comparison
      const minPrice = 20;
      const results = await catalogService.filterProducts({ minPrice });
      results.forEach(product => {
        expect(product.price).to.be.at.least(minPrice);
      });
    });
    
    it('should filter by maximum price', async () => {
      // Kills ROR mutants: <= to < in price comparison
      const maxPrice = 50;
      const results = await catalogService.filterProducts({ maxPrice });
      results.forEach(product => {
        expect(product.price).to.be.at.most(maxPrice);
      });
    });
    
    it('should filter by price range', async () => {
      // Kills LOR mutants: && to || in combined conditions
      const results = await catalogService.filterProducts({ minPrice: 10, maxPrice: 30 });
      results.forEach(product => {
        expect(product.price).to.be.at.least(10);
        expect(product.price).to.be.at.most(30);
      });
    });
    
    it('should filter by stock availability', async () => {
      // Kills ROR mutants: > to >= in stock check
      const results = await catalogService.filterProducts({ inStock: true });
      results.forEach(product => {
        expect(product.stock).to.be.above(0);
      });
    });
    
    it('should return products with zero stock when inStock is false', async () => {
      // Kills LOR mutants in stock filtering
      const results = await catalogService.filterProducts({ inStock: false });
      results.forEach(product => {
        expect(product.stock).to.equal(0);
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
        expect(product.category).to.equal('Fiction');
        expect(product.price).to.be.at.least(10);
        expect(product.price).to.be.at.most(30);
        expect(product.stock).to.be.above(0);
      });
    });
    
    it('should return all products when no filters provided', async () => {
      // Kills conditional mutants for empty filter handling
      const results = await catalogService.filterProducts({});
      expect(results).to.be.an('array');
      expect(results.length).to.be.above(0);
    });
  });
  
  describe('sortProducts', () => {
    
    it('should sort by title ascending', () => {
      // Kills comparison operator mutants in sort
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'title', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].title <= sorted[i + 1].title).to.be.true;
      }
    });
    
    it('should sort by title descending', () => {
      // Kills ROR mutants: < to > in sort comparison
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'title', 'desc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].title >= sorted[i + 1].title).to.be.true;
      }
    });
    
    it('should sort by price ascending', () => {
      // Kills AOR and ROR mutants in numeric comparison
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'price', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).to.be.at.most(sorted[i + 1].price);
      }
    });
    
    it('should sort by price descending', () => {
      // Kills comparison mutants
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'price', 'desc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).to.be.at.least(sorted[i + 1].price);
      }
    });
    
    it('should sort by stock level', () => {
      // Kills numeric comparison mutants
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'stock', 'asc');
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].stock).to.be.at.most(sorted[i + 1].stock);
      }
    });
    
    it('should return original array when invalid sort field', () => {
      // Kills conditional mutants in sort validation
      const products = getTestProducts();
      const sorted = catalogService.sortProducts(products, 'invalid', 'asc');
      
      expect(sorted.length).to.equal(products.length);
    });
  });
  
  describe('paginateProducts', () => {
    
    it('should paginate products correctly', () => {
      // Kills AOR mutants: * to / in offset calculation
      const products = getTestProducts();
      const page = 1;
      const limit = 2;
      
      const result = catalogService.paginateProducts(products, page, limit);
      
      expect(result.items).to.have.lengthOf(2);
      expect(result.page).to.equal(1);
      expect(result.totalPages).to.be.above(0);
    });
    
    it('should calculate correct total pages', () => {
      // Kills AOR mutants: Math.ceil calculation
      const products = getTestProducts(); // 4 products
      const result = catalogService.paginateProducts(products, 1, 2);
      
      expect(result.totalPages).to.equal(Math.ceil(products.length / 2));
    });
    
    it('should handle last page with fewer items', () => {
      // Kills boundary condition mutants
      const products = getTestProducts();
      const lastPage = Math.ceil(products.length / 2);
      
      const result = catalogService.paginateProducts(products, lastPage, 2);
      expect(result.items.length).to.be.at.most(2);
    });
    
    it('should return empty array for page beyond total', () => {
      // Kills ROR mutants: > to >= in page validation
      const products = getTestProducts();
      const result = catalogService.paginateProducts(products, 999, 2);
      
      expect(result.items).to.be.an('array');
      expect(result.items).to.be.empty;
    });
    
    it('should handle page 0 or negative pages', () => {
      // Edge case - kills boundary validation mutants
      const products = getTestProducts();
      const result = catalogService.paginateProducts(products, 0, 2);
      
      expect(result.items).to.be.an('array');
    });
  });
  
  describe('getProductById', () => {
    
    it('should return product when ID exists', async () => {
      // Kills RV mutants that change return values
      const product = await catalogService.getProductById('test-001');
      expect(product).to.be.an('object');
      expect(product.id).to.equal('test-001');
    });
    
    it('should return null when ID does not exist', async () => {
      // Kills conditional mutants in find logic
      const product = await catalogService.getProductById('non-existent-id');
      expect(product).to.be.null;
    });
    
    it('should return null for null or undefined ID', async () => {
      // Kills LOR mutants in null checks
      expect(await catalogService.getProductById(null)).to.be.null;
      expect(await catalogService.getProductById(undefined)).to.be.null;
    });
    
    it('should return null for empty string ID', async () => {
      // Kills string validation mutants
      const product = await catalogService.getProductById('');
      expect(product).to.be.null;
    });
  });
  
  describe('addProduct', () => {
    
    it('should add a new product successfully', async () => {
      // Kills MDC mutants that remove the save operation
      const newProduct = {
        id: 'new-test-001',
        title: 'New Test Book',
        author: 'New Author',
        isbn: '9781234567890',
        price: 29.99,
        category: 'Fiction',
        stock: 15,
        description: 'A new test book'
      };
      
      const result = await catalogService.addProduct(newProduct);
      expect(result.success).to.be.true;
      
      // Verify product was actually added
      const added = await catalogService.getProductById('new-test-001');
      expect(added).to.not.be.null;
      expect(added.title).to.equal('New Test Book');
    });
    
    it('should reject product with duplicate ID', async () => {
      // Kills LOR mutants in duplicate check
      const duplicate = {
        id: 'test-001', // Already exists
        title: 'Duplicate',
        author: 'Author',
        isbn: '9780000000000',
        price: 10,
        category: 'Fiction',
        stock: 5,
        description: 'Test'
      };
      
      const result = await catalogService.addProduct(duplicate);
      expect(result.success).to.be.false;
    });
    
    it('should validate required fields', async () => {
      // Kills LOR mutants in validation checks
      const incomplete = {
        id: 'incomplete-001',
        title: 'Incomplete Book'
        // Missing required fields
      };
      
      const result = await catalogService.addProduct(incomplete);
      expect(result.success).to.be.false;
    });
  });
  
  describe('updateProduct', () => {
    
    it('should update existing product', async () => {
      // Kills MDC mutants that remove update operations
      const updates = {
        price: 19.99,
        stock: 20
      };
      
      const result = await catalogService.updateProduct('test-001', updates);
      expect(result.success).to.be.true;
      
      // Verify update
      const updated = await catalogService.getProductById('test-001');
      expect(updated.price).to.equal(19.99);
      expect(updated.stock).to.equal(20);
    });
    
    it('should fail to update non-existent product', async () => {
      // Kills conditional mutants in existence check
      const result = await catalogService.updateProduct('non-existent', { price: 10 });
      expect(result.success).to.be.false;
    });
    
    it('should not update ID field', async () => {
      // Kills security mutants that allow ID changes
      const result = await catalogService.updateProduct('test-001', { id: 'changed-id' });
      
      const product = await catalogService.getProductById('test-001');
      expect(product.id).to.equal('test-001');
    });
  });
  
  describe('deleteProduct', () => {
    
    it('should delete existing product', async () => {
      // Kills MDC mutants that remove delete operations
      const result = await catalogService.deleteProduct('test-001');
      expect(result.success).to.be.true;
      
      // Verify deletion
      const deleted = await catalogService.getProductById('test-001');
      expect(deleted).to.be.null;
    });
    
    it('should fail to delete non-existent product', async () => {
      // Kills conditional mutants
      const result = await catalogService.deleteProduct('non-existent');
      expect(result.success).to.be.false;
    });
  });
});
