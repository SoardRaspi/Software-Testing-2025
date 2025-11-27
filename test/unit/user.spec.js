/**
 * Unit Tests for User Model
 * 
 * Tests target mutation operators:
 * - ROR: Relational operators in conditions
 * - LOR: Logical operators in validation
 * - Boolean literals in state management
 */

import assert from 'assert';
import { User } from '../../src/models/user.js';

describe('User Model - Unit Tests', () => {
  
  describe('constructor', () => {
    it('should create user with required fields', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      assert.strictEqual(user.userId, 'user-001');
      assert.strictEqual(user.email, 'test@example.com');
      assert.strictEqual(user.name, 'Test User');
      assert.ok(user.createdAt instanceof Date);
      assert.strictEqual(user.lastLogin, null);
      assert.strictEqual(user.isActive, true);
      assert.strictEqual(user.role, 'customer');
      assert.ok(Array.isArray(user.orderHistory));
      assert.strictEqual(user.orderHistory.length, 0);
    });

    it('should set createdAt to current date', () => {
      const before = new Date();
      const user = new User('user-002', 'test@example.com', 'Test');
      const after = new Date();
      
      assert.ok(user.createdAt >= before && user.createdAt <= after);
    });
  });

  describe('recordLogin', () => {
    it('should update lastLogin timestamp', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      assert.strictEqual(user.lastLogin, null);
      
      const before = new Date();
      user.recordLogin();
      const after = new Date();
      
      assert.ok(user.lastLogin instanceof Date);
      assert.ok(user.lastLogin >= before && user.lastLogin <= after);
    });

    it('should update lastLogin on multiple calls', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.recordLogin();
      const firstLogin = user.lastLogin;
      
      // Small delay
      const delay = new Promise(resolve => setTimeout(resolve, 10));
      return delay.then(() => {
        user.recordLogin();
        assert.ok(user.lastLogin > firstLogin);
      });
    });
  });

  describe('isAccountActive', () => {
    it('should return true for active account', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      assert.strictEqual(user.isAccountActive(), true);
    });

    it('should return false for deactivated account', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.isActive = false;
      assert.strictEqual(user.isAccountActive(), false);
    });

    it('should use strict equality check', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.isActive = 1; // Truthy but not true
      assert.strictEqual(user.isAccountActive(), false);
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate active account', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      assert.strictEqual(user.isActive, true);
      
      const result = user.deactivateAccount();
      
      assert.strictEqual(result, true);
      assert.strictEqual(user.isActive, false);
    });

    it('should return false if already deactivated', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.isActive = false;
      
      const result = user.deactivateAccount();
      
      assert.strictEqual(result, false);
      assert.strictEqual(user.isActive, false);
    });

    it('should handle double deactivation', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      assert.strictEqual(user.deactivateAccount(), true);
      assert.strictEqual(user.deactivateAccount(), false);
    });
  });

  describe('activateAccount', () => {
    it('should activate deactivated account', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.isActive = false;
      
      const result = user.activateAccount();
      
      assert.strictEqual(result, true);
      assert.strictEqual(user.isActive, true);
    });

    it('should return false if already active', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      const result = user.activateAccount();
      
      assert.strictEqual(result, false);
      assert.strictEqual(user.isActive, true);
    });

    it('should handle reactivation workflow', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.deactivateAccount();
      assert.strictEqual(user.activateAccount(), true);
      assert.strictEqual(user.isActive, true);
    });
  });

  describe('addOrderToHistory', () => {
    it('should add order to empty history', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory('order-001');
      
      assert.strictEqual(user.orderHistory.length, 1);
      assert.strictEqual(user.orderHistory[0], 'order-001');
    });

    it('should add multiple orders', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory('order-001');
      user.addOrderToHistory('order-002');
      user.addOrderToHistory('order-003');
      
      assert.strictEqual(user.orderHistory.length, 3);
      assert.strictEqual(user.orderHistory[0], 'order-001');
      assert.strictEqual(user.orderHistory[1], 'order-002');
      assert.strictEqual(user.orderHistory[2], 'order-003');
    });

    it('should not add duplicate orders', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory('order-001');
      user.addOrderToHistory('order-001');
      
      assert.strictEqual(user.orderHistory.length, 1);
    });

    it('should not add null or undefined orders', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory(null);
      user.addOrderToHistory(undefined);
      user.addOrderToHistory('');
      
      assert.strictEqual(user.orderHistory.length, 0);
    });

    it('should handle empty string orderId', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory('');
      
      assert.strictEqual(user.orderHistory.length, 0);
    });
  });

  describe('hasOrderHistory', () => {
    it('should return false for new user', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      assert.strictEqual(user.hasOrderHistory(), false);
    });

    it('should return true after adding order', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.addOrderToHistory('order-001');
      assert.strictEqual(user.hasOrderHistory(), true);
    });

    it('should return true with multiple orders', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.addOrderToHistory('order-001');
      user.addOrderToHistory('order-002');
      assert.strictEqual(user.hasOrderHistory(), true);
    });

    it('should use length comparison', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.orderHistory = ['order-001'];
      assert.strictEqual(user.hasOrderHistory(), true);
      
      user.orderHistory = [];
      assert.strictEqual(user.hasOrderHistory(), false);
    });
  });

  describe('isAdmin', () => {
    it('should return false for customer role', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      assert.strictEqual(user.isAdmin(), false);
    });

    it('should return true for admin role', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.role = 'admin';
      assert.strictEqual(user.isAdmin(), true);
    });

    it('should be case sensitive', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.role = 'Admin';
      assert.strictEqual(user.isAdmin(), false);
    });

    it('should return false for other roles', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.role = 'moderator';
      assert.strictEqual(user.isAdmin(), false);
    });
  });

  describe('toJSON', () => {
    it('should convert user to plain object', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.recordLogin();
      user.addOrderToHistory('order-001');
      
      const json = user.toJSON();
      
      assert.strictEqual(json.userId, 'user-001');
      assert.strictEqual(json.email, 'test@example.com');
      assert.strictEqual(json.name, 'Test User');
      assert.ok(json.createdAt instanceof Date);
      assert.ok(json.lastLogin instanceof Date);
      assert.strictEqual(json.isActive, true);
      assert.strictEqual(json.role, 'customer');
      assert.ok(Array.isArray(json.orderHistory));
      assert.strictEqual(json.orderHistory.length, 1);
    });

    it('should include all fields', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      const json = user.toJSON();
      
      assert.ok('userId' in json);
      assert.ok('email' in json);
      assert.ok('name' in json);
      assert.ok('createdAt' in json);
      assert.ok('lastLogin' in json);
      assert.ok('isActive' in json);
      assert.ok('role' in json);
      assert.ok('orderHistory' in json);
    });

    it('should handle null lastLogin', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      const json = user.toJSON();
      
      assert.strictEqual(json.lastLogin, null);
    });

    it('should include deactivated state', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      user.deactivateAccount();
      
      const json = user.toJSON();
      
      assert.strictEqual(json.isActive, false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete user lifecycle', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      // Login
      user.recordLogin();
      assert.ok(user.lastLogin);
      
      // Place orders
      user.addOrderToHistory('order-001');
      user.addOrderToHistory('order-002');
      assert.strictEqual(user.hasOrderHistory(), true);
      
      // Deactivate
      assert.strictEqual(user.deactivateAccount(), true);
      assert.strictEqual(user.isAccountActive(), false);
      
      // Try to deactivate again
      assert.strictEqual(user.deactivateAccount(), false);
      
      // Reactivate
      assert.strictEqual(user.activateAccount(), true);
      assert.strictEqual(user.isAccountActive(), true);
    });

    it('should maintain order history through state changes', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.addOrderToHistory('order-001');
      user.deactivateAccount();
      user.activateAccount();
      
      assert.strictEqual(user.orderHistory.length, 1);
      assert.strictEqual(user.orderHistory[0], 'order-001');
    });

    it('should serialize properly after modifications', () => {
      const user = new User('user-001', 'test@example.com', 'Test User');
      
      user.recordLogin();
      user.addOrderToHistory('order-001');
      user.role = 'admin';
      
      const json = user.toJSON();
      
      assert.strictEqual(json.role, 'admin');
      assert.strictEqual(json.orderHistory.length, 1);
      assert.ok(json.lastLogin);
    });
  });
});
