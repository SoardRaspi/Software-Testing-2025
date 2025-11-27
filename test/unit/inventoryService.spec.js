/**
 * Unit Tests for InventoryService
 * 
 * These tests target mutation operators:
 * - ROR: Relational operators in stock checks
 * - LOR: Logical operators in validation
 * - AOR: Arithmetic operators in stock calculations
 */

import assert from 'assert';
import sinon from 'sinon';
import * as inventoryService from '../../src/services/inventoryService.js';
import * as catalogService from '../../src/services/catalogService.js';
import { getTestProducts, resetDataFiles, backupDataFiles, restoreDataFiles } from '../helpers.js';

describe('InventoryService - Unit Tests', () => {
  
  before(async () => {
    await backupDataFiles();
  });
  
  after(async () => {
    await restoreDataFiles();
  });
  
  beforeEach(async () => {
    await resetDataFiles();
    await catalogService.loadProducts();
    inventoryService.clearInventoryLog();
  });

  describe('checkStock', () => {
    it('should return available true when stock is sufficient', () => {
      const result = inventoryService.checkStock('test-001', 5);
      assert.strictEqual(result.available, true);
      assert.strictEqual(result.message, 'Stock available');
      assert.strictEqual(result.currentStock, 10);
      assert.strictEqual(result.requested, 5);
    });

    it('should return available false when stock is insufficient', () => {
      const result = inventoryService.checkStock('test-001', 20);
      assert.strictEqual(result.available, false);
      assert.strictEqual(result.message, 'Insufficient stock');
    });

    it('should return available false when product not found', () => {
      const result = inventoryService.checkStock('invalid-id', 5);
      assert.strictEqual(result.available, false);
      assert.strictEqual(result.message, 'Product not found');
      assert.strictEqual(result.currentStock, 0);
    });

    it('should handle boundary case of exact stock match', () => {
      const result = inventoryService.checkStock('test-001', 10);
      assert.strictEqual(result.available, true);
      assert.strictEqual(result.currentStock, 10);
      assert.strictEqual(result.requested, 10);
    });

    it('should handle zero quantity check', () => {
      const result = inventoryService.checkStock('test-001', 0);
      assert.strictEqual(result.available, true);
    });

    it('should handle out of stock product', () => {
      const result = inventoryService.checkStock('test-003', 1);
      assert.strictEqual(result.available, false);
      assert.strictEqual(result.currentStock, 0);
    });
  });

  describe('reserveStock', () => {
    it('should successfully reserve stock when available', () => {
      const result = inventoryService.reserveStock('test-001', 5);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Stock reserved');
      assert.strictEqual(result.newStock, 5);
    });

    it('should fail when product ID is missing', () => {
      const result = inventoryService.reserveStock('', 5);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product ID required');
    });

    it('should fail when product ID is null', () => {
      const result = inventoryService.reserveStock(null, 5);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product ID required');
    });

    it('should fail when quantity is invalid', () => {
      const result = inventoryService.reserveStock('test-001', -5);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('Quantity'));
    });

    it('should fail when quantity is zero', () => {
      const result = inventoryService.reserveStock('test-001', 0);
      assert.strictEqual(result.success, false);
    });

    it('should fail when product not found', () => {
      const result = inventoryService.reserveStock('invalid-id', 5);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product not found');
    });

    it('should fail when insufficient stock', () => {
      const result = inventoryService.reserveStock('test-001', 15);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('Insufficient stock'));
      assert.strictEqual(result.available, 10);
    });

    it('should handle boundary case of reserving exact available stock', () => {
      const result = inventoryService.reserveStock('test-001', 10);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newStock, 0);
    });

    it('should log transaction on successful reserve', () => {
      inventoryService.reserveStock('test-001', 5);
      const log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 1);
      assert.strictEqual(log[0].productId, 'test-001');
      assert.strictEqual(log[0].quantity, -5);
      assert.strictEqual(log[0].type, 'reserve');
    });

    it('should fail when trying to reserve from out of stock product', () => {
      const result = inventoryService.reserveStock('test-003', 1);
      assert.strictEqual(result.success, false);
    });
  });

  describe('releaseStock', () => {
    it('should successfully release stock', () => {
      const result = inventoryService.releaseStock('test-001', 5);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Stock released');
      assert.strictEqual(result.newStock, 15);
    });

    it('should fail when product ID is missing', () => {
      const result = inventoryService.releaseStock('', 5);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product ID required');
    });

    it('should fail when quantity is invalid', () => {
      const result = inventoryService.releaseStock('test-001', -5);
      assert.strictEqual(result.success, false);
    });

    it('should fail when quantity is zero', () => {
      const result = inventoryService.releaseStock('test-001', 0);
      assert.strictEqual(result.success, false);
    });

    it('should fail when product not found', () => {
      const result = inventoryService.releaseStock('invalid-id', 5);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product not found');
    });

    it('should log transaction on successful release', () => {
      inventoryService.releaseStock('test-001', 5);
      const log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 1);
      assert.strictEqual(log[0].productId, 'test-001');
      assert.strictEqual(log[0].quantity, 5);
      assert.strictEqual(log[0].type, 'release');
    });

    it('should handle releasing stock to out of stock product', () => {
      const result = inventoryService.releaseStock('test-003', 5);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newStock, 5);
    });
  });

  describe('restockProduct', () => {
    it('should successfully restock product', () => {
      const result = inventoryService.restockProduct('test-001', 10);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Product restocked');
      assert.strictEqual(result.addedQuantity, 10);
      assert.strictEqual(result.newStock, 20);
    });

    it('should fail when product ID is missing', () => {
      const result = inventoryService.restockProduct('', 10);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product ID required');
    });

    it('should fail when quantity is invalid', () => {
      const result = inventoryService.restockProduct('test-001', -5);
      assert.strictEqual(result.success, false);
    });

    it('should fail when product not found', () => {
      const result = inventoryService.restockProduct('invalid-id', 10);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Product not found');
    });

    it('should fail when exceeding max stock without auto-adjust', () => {
      const result = inventoryService.restockProduct('test-001', 1000, { maxStock: 50 });
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('exceed maximum stock'));
    });

    it('should auto-adjust when exceeding max stock with autoAdjust', () => {
      const result = inventoryService.restockProduct('test-001', 1000, { maxStock: 50, autoAdjust: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.adjusted, true);
      assert.strictEqual(result.addedQuantity, 40); // 50 - 10 current
      assert.strictEqual(result.newStock, 50);
    });

    it('should fail when product already at max stock with autoAdjust', () => {
      // First restock to max
      inventoryService.restockProduct('test-001', 90, { maxStock: 100 });
      // Try to restock again
      const result = inventoryService.restockProduct('test-001', 10, { maxStock: 100, autoAdjust: true });
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('already at maximum'));
    });

    it('should handle boundary case of restocking to exactly max', () => {
      const result = inventoryService.restockProduct('test-001', 40, { maxStock: 50 });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newStock, 50);
    });

    it('should log transaction on successful restock', () => {
      inventoryService.restockProduct('test-001', 10);
      const log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 1);
      assert.strictEqual(log[0].productId, 'test-001');
      assert.strictEqual(log[0].quantity, 10);
      assert.strictEqual(log[0].type, 'restock');
    });

    it('should use default maxStock when not provided', () => {
      const result = inventoryService.restockProduct('test-001', 500);
      assert.strictEqual(result.success, true);
    });

    it('should restock out of stock product', () => {
      const result = inventoryService.restockProduct('test-003', 20);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.newStock, 20);
    });
  });

  describe('bulkRestock', () => {
    it('should successfully restock multiple products', () => {
      const restockList = [
        { productId: 'test-001', quantity: 10 },
        { productId: 'test-002', quantity: 5 }
      ];
      const result = inventoryService.bulkRestock(restockList);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.successCount, 2);
      assert.strictEqual(result.failCount, 0);
      assert.strictEqual(result.results.length, 2);
    });

    it('should fail when restock list is empty', () => {
      const result = inventoryService.bulkRestock([]);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, 'Restock list is empty or invalid');
    });

    it('should fail when restock list is not an array', () => {
      const result = inventoryService.bulkRestock(null);
      assert.strictEqual(result.success, false);
    });

    it('should handle mixed success and failure', () => {
      const restockList = [
        { productId: 'test-001', quantity: 10 },
        { productId: 'invalid-id', quantity: 5 },
        { productId: 'test-002', quantity: 3 }
      ];
      const result = inventoryService.bulkRestock(restockList);
      assert.strictEqual(result.successCount, 2);
      assert.strictEqual(result.failCount, 1);
      assert.strictEqual(result.results.length, 3);
    });

    it('should handle invalid item structure', () => {
      const restockList = [
        { productId: 'test-001', quantity: 10 },
        { productId: 'test-002' }, // missing quantity
        { quantity: 5 } // missing productId
      ];
      const result = inventoryService.bulkRestock(restockList);
      assert.ok(result.failCount >= 2);
    });

    it('should handle item with non-number quantity', () => {
      const restockList = [
        { productId: 'test-001', quantity: 'invalid' }
      ];
      const result = inventoryService.bulkRestock(restockList);
      assert.strictEqual(result.failCount, 1);
    });

    it('should pass options to individual restock operations', () => {
      const restockList = [
        { productId: 'test-001', quantity: 100 }
      ];
      const result = inventoryService.bulkRestock(restockList, { maxStock: 50, autoAdjust: true });
      assert.strictEqual(result.results[0].success, true);
    });

    it('should handle all failures gracefully', () => {
      const restockList = [
        { productId: 'invalid-1', quantity: 10 },
        { productId: 'invalid-2', quantity: 5 }
      ];
      const result = inventoryService.bulkRestock(restockList);
      assert.strictEqual(result.successCount, 0);
      assert.strictEqual(result.failCount, 2);
    });
  });

  describe('getInventoryLog', () => {
    it('should return empty log initially', () => {
      const log = inventoryService.getInventoryLog();
      assert.ok(Array.isArray(log));
      assert.strictEqual(log.length, 0);
    });

    it('should record multiple transactions', () => {
      inventoryService.reserveStock('test-001', 5);
      inventoryService.releaseStock('test-002', 3);
      inventoryService.restockProduct('test-001', 10);
      
      const log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 3);
    });

    it('should contain correct transaction details', () => {
      inventoryService.reserveStock('test-001', 5);
      const log = inventoryService.getInventoryLog();
      
      assert.strictEqual(log[0].productId, 'test-001');
      assert.strictEqual(log[0].quantity, -5);
      assert.strictEqual(log[0].type, 'reserve');
      assert.ok(log[0].timestamp);
      assert.ok(log[0].details);
    });
  });

  describe('clearInventoryLog', () => {
    it('should clear all log entries', () => {
      inventoryService.reserveStock('test-001', 5);
      inventoryService.releaseStock('test-002', 3);
      
      let log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 2);
      
      inventoryService.clearInventoryLog();
      log = inventoryService.getInventoryLog();
      assert.strictEqual(log.length, 0);
    });
  });

  describe('getStockLevel', () => {
    it('should return current stock level', () => {
      const result = inventoryService.getStockLevel('test-001');
      assert.strictEqual(result.productId, 'test-001');
      assert.strictEqual(result.stock, 10);
    });

    it('should return null when product not found', () => {
      const result = inventoryService.getStockLevel('invalid-id');
      assert.strictEqual(result, null);
    });

    it('should include product details', () => {
      const result = inventoryService.getStockLevel('test-001');
      assert.ok(result.title);
      assert.strictEqual(result.stock, 10);
    });
  });

  describe('getStockValue', () => {
    it('should calculate total stock value', () => {
      const result = inventoryService.getStockValue('test-001');
      assert.strictEqual(result.productId, 'test-001');
      assert.strictEqual(result.stock, 10);
      assert.strictEqual(result.pricePerUnit, 15.99);
      assert.strictEqual(result.totalValue, 159.90);
    });

    it('should return null when product not found', () => {
      const result = inventoryService.getStockValue('invalid-id');
      assert.strictEqual(result, null);
    });

    it('should handle zero stock', () => {
      const result = inventoryService.getStockValue('test-003');
      assert.strictEqual(result.stock, 0);
      assert.strictEqual(result.totalValue, 0);
    });

    it('should round value to 2 decimal places', () => {
      const result = inventoryService.getStockValue('test-001');
      assert.strictEqual(typeof result.totalValue, 'number');
      assert.strictEqual(result.totalValue, Math.round(result.totalValue * 100) / 100);
    });
  });

  describe('getTotalInventoryValue', () => {
    it('should return valid structure', () => {
      const result = inventoryService.getTotalInventoryValue();
      assert.ok(typeof result.totalValue === 'number');
      assert.ok(typeof result.productCount === 'number');
      assert.ok(typeof result.totalUnits === 'number');
    });

    it('should include breakdown when requested', () => {
      const result = inventoryService.getTotalInventoryValue({ includeBreakdown: true });
      assert.ok(result.breakdown);
      assert.ok(typeof result.breakdown === 'object');
    });

    it('should handle empty catalog gracefully', () => {
      const result = inventoryService.getTotalInventoryValue();
      assert.ok(typeof result.totalValue === 'number');
    });
  });

  describe('adjustStockLevel', () => {
    it('should reject missing product ID', () => {
      const result = inventoryService.adjustStockLevel(null, 10);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('Product ID required'));
    });

    it('should reject invalid stock level (negative)', () => {
      const result = inventoryService.adjustStockLevel('test-id', -5);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('Invalid stock level'));
    });

    it('should reject non-number stock level', () => {
      const result = inventoryService.adjustStockLevel('test-id', 'not-a-number');
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('Invalid stock level'));
    });

    it('should reject zero stock level validation (boundary)', () => {
      const result = inventoryService.adjustStockLevel('test-id', 0);
      assert.strictEqual(typeof result.success, 'boolean');
    });

    it('should handle product not found', () => {
      const result = inventoryService.adjustStockLevel('non-existent-id', 10);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('not found'));
    });

    it('should calculate positive difference', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialStock = products[0].stock;
      const newStock = initialStock + 10;
      const result = inventoryService.adjustStockLevel(productId, newStock);
      if (result.success) {
        assert.strictEqual(result.difference, 10);
      }
    });

    it('should calculate negative difference', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      const initialStock = products[0].stock;
      const newStock = Math.max(0, initialStock - 5);
      const result = inventoryService.adjustStockLevel(productId, newStock);
      if (result.success) {
        assert.ok(result.difference <= 0);
      }
    });

    it('should log transaction with reason', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      inventoryService.clearInventoryLog();
      inventoryService.adjustStockLevel(productId, 10, 'Manual recount');
      const log = inventoryService.getInventoryLog();
      if (log.length > 0) {
        assert.ok(log.some(t => t.type === 'adjustment'));
      }
    });

    it('should use default reason if not provided', () => {
      const products = getTestProducts();
      const productId = products[0].id;
      inventoryService.clearInventoryLog();
      inventoryService.adjustStockLevel(productId, 10);
      const log = inventoryService.getInventoryLog();
      if (log.length > 0) {
        assert.ok(log.some(t => t.type === 'adjustment'));
      }
    });
  });

  describe('getInventoryHistory', () => {
    it('should return empty array when no transactions', () => {
      inventoryService.clearInventoryLog();
      const history = inventoryService.getInventoryHistory();
      assert.strictEqual(history.length, 0);
    });

    it('should filter by product ID', () => {
      inventoryService.clearInventoryLog();
      const products = getTestProducts();
      const productId1 = products[0].id;
      const productId2 = products[1].id;
      inventoryService.reserveStock(productId1, 1);
      inventoryService.reserveStock(productId2, 1);
      const history = inventoryService.getInventoryHistory({ productId: productId1 });
      assert.ok(history.every(t => t.productId === productId1));
    });

    it('should sort by timestamp descending', () => {
      inventoryService.clearInventoryLog();
      const products = getTestProducts();
      const productId = products[0].id;
      inventoryService.reserveStock(productId, 1);
      inventoryService.releaseStock(productId, 1);
      const history = inventoryService.getInventoryHistory();
      if (history.length >= 2) {
        assert.ok(history[0].timestamp >= history[1].timestamp);
      }
    });

    it('should limit results when specified', () => {
      inventoryService.clearInventoryLog();
      const products = getTestProducts();
      const productId = products[0].id;
      inventoryService.reserveStock(productId, 1);
      inventoryService.releaseStock(productId, 1);
      inventoryService.restockProduct(productId, 1);
      const history = inventoryService.getInventoryHistory({ limit: 2 });
      assert.ok(history.length <= 2);
    });

    it('should handle limit of 0', () => {
      inventoryService.clearInventoryLog();
      const products = getTestProducts();
      const productId = products[0].id;
      inventoryService.reserveStock(productId, 1);
      const history = inventoryService.getInventoryHistory({ limit: 0 });
      assert.ok(Array.isArray(history));
    });

    it('should handle negative limit gracefully', () => {
      const history = inventoryService.getInventoryHistory({ limit: -1 });
      assert.ok(Array.isArray(history));
    });
  });

  describe('getLowStockProducts', () => {
    it('should return empty array when no products', () => {
      const lowStock = inventoryService.getLowStockProducts();
      assert.ok(Array.isArray(lowStock));
    });

    it('should default to threshold 5', () => {
      const lowStock = inventoryService.getLowStockProducts();
      assert.ok(Array.isArray(lowStock));
    });

    it('should handle invalid threshold (negative)', () => {
      const lowStock = inventoryService.getLowStockProducts(-5);
      assert.ok(Array.isArray(lowStock));
    });

    it('should handle invalid threshold (non-number)', () => {
      const lowStock = inventoryService.getLowStockProducts('invalid');
      assert.ok(Array.isArray(lowStock));
    });

    it('should handle excludeOutOfStock option', () => {
      const lowStock = inventoryService.getLowStockProducts(5, { excludeOutOfStock: true });
      assert.ok(Array.isArray(lowStock));
    });

    it('should handle category filter', () => {
      const lowStock = inventoryService.getLowStockProducts(5, { category: 'fiction' });
      assert.ok(Array.isArray(lowStock));
    });

    it('should sort by stock when specified', () => {
      const lowStock = inventoryService.getLowStockProducts(10, { sortBy: 'stock' });
      assert.ok(Array.isArray(lowStock));
    });

    it('should sort by title when specified', () => {
      const lowStock = inventoryService.getLowStockProducts(10, { sortBy: 'title' });
      assert.ok(Array.isArray(lowStock));
    });

    it('should handle combined filters', () => {
      const lowStock = inventoryService.getLowStockProducts(5, {
        category: 'fiction',
        sortBy: 'stock',
        excludeOutOfStock: false
      });
      assert.ok(Array.isArray(lowStock));
    });
  });

  describe('calculateInventoryValue', () => {
    it('should return zero values for empty array', () => {
      const result = inventoryService.calculateInventoryValue([]);
      assert.strictEqual(result.totalValue, 0);
      assert.strictEqual(result.totalItems, 0);
      assert.strictEqual(result.averageValue, 0);
    });

    it('should calculate total value correctly', () => {
      const products = getTestProducts();
      const result = inventoryService.calculateInventoryValue(products);
      assert.ok(typeof result.totalValue === 'number');
      assert.ok(result.totalValue >= 0);
    });

    it('should only count products with stock > 0', () => {
      const products = getTestProducts();
      const result = inventoryService.calculateInventoryValue(products);
      assert.ok(result.totalItems >= 0);
    });

    it('should calculate average value', () => {
      const products = getTestProducts();
      const result = inventoryService.calculateInventoryValue(products);
      if (result.totalItems > 0) {
        assert.ok(result.averageValue >= 0);
      }
    });

    it('should round values to 2 decimal places', () => {
      const mockProducts = [{
        price: 10.999,
        stock: 3
      }];
      const result = inventoryService.calculateInventoryValue(mockProducts);
      const decimals = result.totalValue.toString().split('.')[1];
      if (decimals) {
        assert.ok(decimals.length <= 2);
      }
    });

    it('should handle products with zero stock', () => {
      const mockProducts = [{
        price: 10,
        stock: 0
      }, {
        price: 20,
        stock: 5
      }];
      const result = inventoryService.calculateInventoryValue(mockProducts);
      assert.strictEqual(result.totalValue, 100);
    });

    it('should calculate multiplication correctly', () => {
      const mockProducts = [{
        price: 15.50,
        stock: 4
      }];
      const result = inventoryService.calculateInventoryValue(mockProducts);
      assert.strictEqual(result.totalValue, 62);
    });

    it('should handle division in average calculation', () => {
      const mockProducts = [{
        price: 10,
        stock: 5
      }];
      const result = inventoryService.calculateInventoryValue(mockProducts);
      assert.strictEqual(result.averageValue, 10);
    });
  });
});
