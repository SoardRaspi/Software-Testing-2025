/**
 * Test Helpers and Utilities
 * Provides common functions for test setup, teardown, and data fixtures
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to data files
const PRODUCTS_PATH = path.join(__dirname, '../../data/products.json');
const ORDERS_PATH = path.join(__dirname, '../../data/orders.json');
const PRODUCTS_BACKUP_PATH = path.join(__dirname, '../../data/products.backup.json');
const ORDERS_BACKUP_PATH = path.join(__dirname, '../../data/orders.backup.json');

/**
 * Backup original data files before tests
 */
export async function backupDataFiles() {
  try {
    const productsData = await fs.readFile(PRODUCTS_PATH, 'utf-8');
    await fs.writeFile(PRODUCTS_BACKUP_PATH, productsData);
    
    const ordersData = await fs.readFile(ORDERS_PATH, 'utf-8');
    await fs.writeFile(ORDERS_BACKUP_PATH, ordersData);
  } catch (error) {
    console.warn('Warning: Could not backup data files:', error.message);
  }
}

/**
 * Restore original data files after tests
 */
export async function restoreDataFiles() {
  try {
    const productsBackup = await fs.readFile(PRODUCTS_BACKUP_PATH, 'utf-8');
    await fs.writeFile(PRODUCTS_PATH, productsBackup);
    
    const ordersBackup = await fs.readFile(ORDERS_BACKUP_PATH, 'utf-8');
    await fs.writeFile(ORDERS_PATH, ordersBackup);
    
    // Clean up backup files
    await fs.unlink(PRODUCTS_BACKUP_PATH);
    await fs.unlink(ORDERS_BACKUP_PATH);
  } catch (error) {
    console.warn('Warning: Could not restore data files:', error.message);
  }
}

/**
 * Reset data files to initial state
 */
export async function resetDataFiles() {
  try {
    // Reset orders to empty array
    await fs.writeFile(ORDERS_PATH, '[]');
    
    // Keep products as is (or load from backup if exists)
    try {
      const productsBackup = await fs.readFile(PRODUCTS_BACKUP_PATH, 'utf-8');
      await fs.writeFile(PRODUCTS_PATH, productsBackup);
    } catch {
      // Backup doesn't exist, use default fixture
      await fs.writeFile(PRODUCTS_PATH, JSON.stringify(getTestProducts(), null, 2));
    }
  } catch (error) {
    console.error('Error resetting data files:', error);
  }
}

/**
 * Get test product fixtures
 */
export function getTestProducts() {
  return [
    {
      id: "test-001",
      title: "Test Book One",
      author: "Test Author",
      isbn: "9780743273565",
      price: 15.99,
      category: "Fiction",
      stock: 10,
      description: "A test book"
    },
    {
      id: "test-002",
      title: "Test Book Two",
      author: "Another Author",
      isbn: "9780061120084",
      price: 25.50,
      category: "Non-Fiction",
      stock: 5,
      description: "Another test book"
    },
    {
      id: "test-003",
      title: "Out of Stock Book",
      author: "No Stock Author",
      isbn: "9780451524935",
      price: 20.00,
      category: "Fiction",
      stock: 0,
      description: "This book is out of stock"
    },
    {
      id: "test-004",
      title: "Expensive Book",
      author: "Premium Author",
      isbn: "9780062316097",
      price: 99.99,
      category: "Technology",
      stock: 3,
      description: "An expensive book"
    }
  ];
}

/**
 * Get test cart fixture
 */
export function getTestCart() {
  return {
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0
  };
}

/**
 * Get test order fixture
 */
export function getTestOrder() {
  return {
    id: "order-test-001",
    userId: "user-test-001",
    items: [
      {
        productId: "test-001",
        title: "Test Book One",
        price: 15.99,
        quantity: 2
      }
    ],
    subtotal: 31.98,
    discount: 0,
    shipping: 5.99,
    tax: 2.56,
    total: 40.53,
    status: "pending",
    shippingAddress: {
      fullName: "Test User",
      street: "123 Test St",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      country: "USA",
      phone: "555-1234"
    },
    paymentMethod: "credit_card",
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a mock product
 */
export function createMockProduct(overrides = {}) {
  return {
    id: "mock-001",
    title: "Mock Book",
    author: "Mock Author",
    isbn: "9780123456789",
    price: 19.99,
    category: "Fiction",
    stock: 10,
    description: "A mock product for testing",
    ...overrides
  };
}

/**
 * Wait for a specified time (useful for async tests)
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clone an object (useful for test data isolation)
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate random string (useful for unique IDs in tests)
 */
export function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Assert that a value is within a range (useful for floating point comparisons)
 */
export function assertInRange(value, min, max, message = '') {
  if (value < min || value > max) {
    throw new Error(
      message || `Expected ${value} to be between ${min} and ${max}`
    );
  }
}

/**
 * Create test user session data
 */
export function createTestSession(overrides = {}) {
  return {
    sessionId: `session-${randomString()}`,
    userId: `user-${randomString()}`,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Validation helper - check if object matches expected shape
 */
export function validateShape(obj, expectedKeys) {
  const objKeys = Object.keys(obj);
  const missingKeys = expectedKeys.filter(key => !objKeys.includes(key));
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
  }
  
  return true;
}
