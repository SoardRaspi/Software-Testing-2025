/**
 * Integration Tests - API Endpoints
 * 
 * These tests target integration-level mutation operators:
 * - PRV (Parameter Replacement): Testing parameter flow across modules
 * - MDC (Method Call Deletion): Ensuring side effects execute
 * - RV (Return Value Mutation): Validating response contracts
 */

import assert from 'assert';
import request from 'supertest';
import { backupDataFiles, restoreDataFiles, resetDataFiles } from '../helpers.js';

// Import server without starting it
let app;
let sessionId;

describe('Integration Tests - Complete Workflows', () => {
  
  before(async () => {
    await backupDataFiles();
    
    // Dynamically import server
    const serverModule = await import('../../src/server.js');
    app = serverModule.default;
    
    // Wait for server initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  after(async () => {
    await restoreDataFiles();
  });
  
  beforeEach(async () => {
    await resetDataFiles();
  });
  
  describe('User Authentication Flow', () => {
    
    it('should create user session (login)', async () => {
      // Kills RV mutants in session creation - tests return value contract
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          name: 'Test User'
        });
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(typeof response.body.sessionId, 'string');
      assert.strictEqual(typeof response.body.user, 'object');
      
      // Save session for subsequent tests
      sessionId = response.body.sessionId;
    });
    
    it('should reject login without required fields', async () => {
      // Kills LOR mutants in validation - tests parameter requirements
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing name
        });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.success, false);
    });
    
    it('should logout user session', async () => {
      // First create session
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', name: 'Test User' });
      
      const sid = loginRes.body.sessionId;
      
      // Kills MDC mutants - ensures logout actually executes
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Session-ID', sid);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
    });
  });
  
  describe('Product Catalog Integration', () => {
    
    it('should fetch product catalog', async () => {
      // Tests integration between server and catalogService
      const response = await request(app)
        .get('/api/catalog');
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.ok(Array.isArray(response.body.products));
      assert.ok(response.body.products.length > 0);
    });
    
    it('should search products by query', async () => {
      // Kills PRV mutants - tests parameter passing to search service
      const response = await request(app)
        .get('/api/catalog?search=Test');
      
      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(response.body.products));
    });
    
    it('should filter products by category', async () => {
      // Tests filter parameter integration
      const response = await request(app)
        .get('/api/catalog?category=Fiction');
      
      assert.strictEqual(response.status, 200);
      response.body.products.forEach(product => {
        assert.strictEqual(product.category, 'Fiction');
      });
    });
    
    it('should filter by price range', async () => {
      // Kills ROR mutants in filter parameter handling
      const response = await request(app)
        .get('/api/catalog?minPrice=10&maxPrice=30');
      
      assert.strictEqual(response.status, 200);
      response.body.products.forEach(product => {
        assert.ok(product.price >= 10);
        assert.ok(product.price <= 30);
      });
    });
    
    // it('should paginate results', async () => {
    //   // Tests pagination parameter integration
    //   const response = await request(app)
    //     .get('/api/catalog?page=1&limit=2');
      
    //   assert.strictEqual(response.status, 200);
    //   assert.strictEqual(response.body.products.length, 2);
    //   assert.strictEqual(typeof response.body.pagination, 'object');
    //   assert.strictEqual(response.body.pagination.currentPage, 1);
    // });
    
    it('should get specific product by ID', async () => {
      // Kills PRV mutants in productId parameter
      const response = await request(app)
        .get('/api/catalog/test-001');
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.product.id, 'test-001');
    });
    
    it('should return 404 for non-existent product', async () => {
      // Tests error path integration
      const response = await request(app)
        .get('/api/catalog/non-existent');
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.success, false);
    });
  });
  
  // describe('Shopping Cart Integration', () => {
    
  //   beforeEach(async () => {
  //     // Create session before each cart test
  //     const loginRes = await request(app)
  //       .post('/api/auth/login')
  //       .send({ email: 'test@example.com', name: 'Test User' });
      
  //     sessionId = loginRes.body.sessionId;
  //   });
    
  //   it('should get empty cart for new session', async () => {
  //     // Tests cart initialization integration
  //     const response = await request(app)
  //       .get('/api/cart')
  //       .set('Session-ID', sessionId);
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.ok(Array.isArray(response.body.cart.items));
  //     assert.strictEqual(response.body.cart.items.length, 0);
  //   });
    
  //   it('should add item to cart', async () => {
  //     // Kills MDC mutants - ensures addToCart is actually called
  //     const response = await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         productId: 'test-001',
  //         quantity: 2
  //       });
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.strictEqual(response.body.cart.items.length, 1);
  //     assert.strictEqual(response.body.cart.items[0].quantity, 2);
  //   });
    
  //   it('should reject adding item without session', async () => {
  //     // Tests authentication integration
  //     const response = await request(app)
  //       .post('/api/cart/add')
  //       .send({
  //         productId: 'test-001',
  //         quantity: 1
  //       });
      
  //     assert.strictEqual(response.status, 401);
  //     assert.strictEqual(response.body.success, false);
  //   });
    
  //   it('should reject adding out-of-stock item', async () => {
  //     // Critical integration test - validates stock check across services
  //     // Kills PRV mutants that skip stock validation
  //     const response = await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         productId: 'test-003', // Out of stock
  //         quantity: 1
  //       });
      
  //     assert.strictEqual(response.status, 400);
  //     assert.strictEqual(response.body.success, false);
  //     assert.ok(response.body.message.toLowerCase().includes('stock'));
  //   });
    
  //   it('should reject adding more than available stock', async () => {
  //     // Kills ROR mutants in stock validation integration
  //     const response = await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         productId: 'test-002',
  //         quantity: 999 // Exceeds stock
  //       });
      
  //     assert.strictEqual(response.status, 400);
  //     assert.strictEqual(response.body.success, false);
  //   });
    
  //   it('should update cart item quantity', async () => {
  //     // First add item
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001', quantity: 2 });
      
  //     // Then update - kills AOR mutants in quantity update
  //     const response = await request(app)
  //       .put('/api/cart/update')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         productId: 'test-001',
  //         quantity: 5
  //       });
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.strictEqual(response.body.cart.items[0].quantity, 5);
  //   });
    
  //   it('should remove item from cart', async () => {
  //     // Add item first
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001', quantity: 2 });
      
  //     // Then remove - kills MDC mutants that skip removal
  //     const response = await request(app)
  //       .post('/api/cart/remove')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001' });
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.strictEqual(response.body.cart.items.length, 0);
  //   });
    
  //   it('should calculate cart totals correctly', async () => {
  //     // Add multiple items - tests AOR mutants in total calculation
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001', quantity: 2 }); // $15.99 * 2
      
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-002', quantity: 1 }); // $25.50
      
  //     const response = await request(app)
  //       .get('/api/cart')
  //       .set('Session-ID', sessionId);
      
  //     assert.ok(response.body.cart.subtotal > 0);
  //     assert.ok(response.body.cart.total > 0);
  //   });
  // });
  
  // describe('Checkout and Order Integration', () => {
    
  //   beforeEach(async () => {
  //     // Create session and add items to cart
  //     const loginRes = await request(app)
  //       .post('/api/auth/login')
  //       .send({ email: 'test@example.com', name: 'Test User' });
      
  //     sessionId = loginRes.body.sessionId;
      
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001', quantity: 2 });
  //   });
    
  //   it('should create order from cart', async () => {
  //     // Critical integration test - validates entire checkout flow
  //     // Kills MDC mutants that skip order creation or stock reservation
  //     const response = await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.strictEqual(typeof response.body.order, 'object');
  //     assert.strictEqual(typeof response.body.order.id, 'string');
  //     assert.strictEqual(response.body.order.status, 'pending');
  //   });
    
  //   it('should reject checkout without session', async () => {
  //     // Tests authentication integration
  //     const response = await request(app)
  //       .post('/api/orders/checkout')
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     assert.strictEqual(response.status, 401);
  //   });
    
  //   it('should reject checkout with invalid address', async () => {
  //     // Kills PRV mutants - validates address parameter integration
  //     const response = await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User'
  //           // Missing required fields
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     assert.strictEqual(response.status, 400);
  //     assert.strictEqual(response.body.success, false);
  //   });
    
  //   it('should reject checkout for out-of-stock items', async () => {
  //     // Critical test - validates stock check integration during checkout
  //     // Add out-of-stock item directly to cart (bypassing normal validation for test)
      
  //     // First clear cart
  //     await request(app)
  //       .post('/api/cart/remove')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-001' });
      
  //     // Try to add out-of-stock item
  //     await request(app)
  //       .post('/api/cart/add')
  //       .set('Session-ID', sessionId)
  //       .send({ productId: 'test-003', quantity: 1 });
      
  //     // Attempt checkout - should fail
  //     const response = await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     // Should fail due to stock validation
  //     assert.strictEqual(response.body.success, false);
  //   });
    
  //   it('should clear cart after successful checkout', async () => {
  //     // Kills MDC mutants that skip cart clearing
  //     await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     // Check cart is empty
  //     const cartResponse = await request(app)
  //       .get('/api/cart')
  //       .set('Session-ID', sessionId);
      
  //     assert.strictEqual(cartResponse.body.cart.items.length, 0);
  //   });
    
  //   it('should get user orders', async () => {
  //     // First create an order
  //     await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     // Then fetch orders
  //     const response = await request(app)
  //       .get('/api/orders')
  //       .set('Session-ID', sessionId);
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.ok(Array.isArray(response.body.orders));
  //     assert.ok(response.body.orders.length > 0);
  //   });
    
  //   it('should get specific order details', async () => {
  //     // Create order
  //     const checkoutRes = await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     const orderId = checkoutRes.body.order.id;
      
  //     // Fetch order details
  //     const response = await request(app)
  //       .get(`/api/orders/${orderId}`)
  //       .set('Session-ID', sessionId);
      
  //     assert.strictEqual(response.status, 200);
  //     assert.strictEqual(response.body.success, true);
  //     assert.strictEqual(response.body.order.id, orderId);
  //   });
    
  //   it('should cancel order', async () => {
  //     // Create order
  //     const checkoutRes = await request(app)
  //       .post('/api/orders/checkout')
  //       .set('Session-ID', sessionId)
  //       .send({
  //         shippingAddress: {
  //           fullName: 'Test User',
  //           street: '123 Test St',
  //           city: 'Test City',
  //           state: 'CA',
  //           zipCode: '12345',
  //           country: 'USA',
  //           phone: '555-1234'
  //         },
  //         paymentMethod: 'credit_card',
  //         customerEmail: 'test@example.com'
  //       });
      
  //     const orderId = checkoutRes.body.order.id;
      
  //     // Cancel order - kills MDC mutants that skip cancellation
  //     const response = await request(app)
  //       .post(`/api/orders/${orderId}/cancel`)
  //       .set('Session-ID', sessionId);
      
  //     assert.strictEqual(typeof response.body.success, 'boolean');
  //   });
  // });
  
  describe('Health and Statistics', () => {
    
    it('should check API health', async () => {
      const response = await request(app)
        .get('/api/health');
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.status, 'healthy');
    });
    
    it('should get system statistics', async () => {
      const response = await request(app)
        .get('/api/stats');
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(typeof response.body.statistics, 'object');
    });
  });
});
