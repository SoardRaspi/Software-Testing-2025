/**
 * Application Logic Module
 * Orchestrates business logic and provides high-level functions for the server
 */

import * as catalogService from './services/catalogService.js';
// import * as cartService from './services/cartService.js';
import * as inventoryService from './services/inventoryService.js';
import * as orderService from './services/orderService.js';
import { User } from './models/user.js';

// Simple in-memory session storage (in production, use Redis or similar)
const sessions = new Map();
const users = new Map();

/**
 * Initializes the application
 * @returns {Promise<boolean>} true if successful
 */
export async function initialize() {
  console.log('Initializing application...');
  
  // Load products from file
  const productsLoaded = await catalogService.loadProducts();
  if (productsLoaded) {
    console.log('Products loaded successfully');
  } else {
    console.warn('Failed to load products or no products file found');
  }

  // Load orders from file
  const ordersLoaded = await orderService.loadOrders();
  if (ordersLoaded) {
    console.log('Orders loaded successfully');
  } else {
    console.log('No existing orders found (starting fresh)');
  }

  console.log('Application initialized');
  return true;
}

/**
 * Creates a new user session (simulated authentication)
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {object} Session info
 */
export function createUserSession(email, name) {
  // Check if user exists
  let user = Array.from(users.values()).find(u => u.email === email);

  if (!user) {
    // Create new user
    const userId = generateUserId();
    user = new User(userId, email, name);
    users.set(userId, user);
  }

  user.recordLogin();

  // Create session
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    userId: user.userId,
    email: user.email,
    name: user.name,
    createdAt: new Date()
  });

  return {
    sessionId,
    user: user.toJSON()
  };
}

/**
 * Validates a session
 * @param {string} sessionId - Session identifier
 * @returns {object|null} Session data or null
 */
export function validateSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session is expired (24 hours)
  const sessionAge = Date.now() - session.createdAt.getTime();
  const maxAge = 24 * 60 * 60 * 1000;

  if (sessionAge > maxAge) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Ends a user session
 * @param {string} sessionId - Session to end
 * @returns {boolean} true if successful
 */
export function endSession(sessionId) {
  return sessions.delete(sessionId);
}

/**
 * Gets catalog with filters and pagination
 * @param {object} params - Query parameters
 * @returns {object} Catalog results
 */
export function getCatalog(params = {}) {
  const { page = 1, limit = 20, search, category, minPrice, maxPrice, sortBy, order } = params;

  let products;

  // Apply search if provided
  if (search) {
    products = catalogService.searchProducts(search);
  } else {
    // Get all products
    const result = catalogService.getAllProducts(page, limit);
    products = result.products;
  }

  // Apply filters
  if (category || minPrice !== undefined || maxPrice !== undefined) {
    const filters = {};
    if (category) filters.category = category;
    if (minPrice !== undefined) filters.minPrice = parseFloat(minPrice);
    if (maxPrice !== undefined) filters.maxPrice = parseFloat(maxPrice);

    products = catalogService.filterProducts(filters);
  }

  // Apply sorting
  if (sortBy) {
    products = catalogService.sortProducts(products, sortBy, order || 'asc');
  }

  return {
    products,
    total: products.length,
    page: parseInt(page),
    limit: parseInt(limit)
  };
}

/**
 * Gets product details
 * @param {string} productId - Product identifier
 * @returns {object|null} Product details or null
 */
export function getProductDetails(productId) {
  const product = catalogService.getProductById(productId);
  
  if (!product) {
    return null;
  }

  // Get recommendations
  const recommendations = catalogService.getRecommendations(productId, 4);

  return {
    product: product.toJSON(),
    recommendations: recommendations.map(p => p.toJSON()),
    inStock: product.isInStock(),
    lowStock: product.isLowStock()
  };
}

/**
 * Handles adding item to cart
 * @param {string} sessionId - User session
 * @param {string} productId - Product to add
 * @param {number} quantity - Quantity
 * @returns {object} Result
 */
export function handleAddToCart(sessionId, productId, quantity) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return { success: false, message: 'Invalid or expired session' };
  }

  return cartService.addToCart(session.userId, productId, quantity);
}

/**
 * Handles removing item from cart
 * @param {string} sessionId - User session
 * @param {string} productId - Product to remove
 * @returns {object} Result
 */
export function handleRemoveFromCart(sessionId, productId) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return { success: false, message: 'Invalid or expired session' };
  }

  return cartService.removeFromCart(session.userId, productId);
}

/**
 * Handles updating cart quantity
 * @param {string} sessionId - User session
 * @param {string} productId - Product to update
 * @param {number} quantity - New quantity
 * @returns {object} Result
 */
export function handleUpdateCartQuantity(sessionId, productId, quantity) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return { success: false, message: 'Invalid or expired session' };
  }

  return cartService.updateCartQuantity(session.userId, productId, quantity);
}

/**
 * Gets user's cart
 * @param {string} sessionId - User session
 * @returns {object|null} Cart summary or null
 */
export function getUserCart(sessionId) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return null;
  }

  return cartService.getCartSummary(session.userId);
}

/**
 * Handles checkout process
 * @param {string} sessionId - User session
 * @param {object} orderDetails - Order details
 * @returns {Promise<object>} Checkout result
 */
export async function handleCheckout(sessionId, orderDetails) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return { success: false, message: 'Invalid or expired session' };
  }

  return await orderService.createOrder(session.userId, orderDetails);
}

/**
 * Gets user's orders
 * @param {string} sessionId - User session
 * @param {object} options - Filter options
 * @returns {Array|null} Orders or null
 */
export function getUserOrders(sessionId, options = {}) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return null;
  }

  return orderService.getUserOrders(session.userId, options);
}

/**
 * Gets order details
 * @param {string} sessionId - User session
 * @param {string} orderId - Order identifier
 * @returns {object|null} Order or null
 */
export function getOrderDetails(sessionId, orderId) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return null;
  }

  const order = orderService.getOrderById(orderId);
  
  // Verify order belongs to user
  if (order && order.userId === session.userId) {
    return order.toJSON();
  }

  return null;
}

/**
 * Handles order cancellation
 * @param {string} sessionId - User session
 * @param {string} orderId - Order to cancel
 * @returns {object} Cancellation result
 */
export function handleCancelOrder(sessionId, orderId) {
  const session = validateSession(sessionId);
  
  if (!session) {
    return { success: false, message: 'Invalid or expired session' };
  }

  return orderService.cancelOrder(orderId, session.userId);
}

/**
 * Gets featured products
 * @param {number} limit - Number of products
 * @returns {Array} Featured products
 */
export function getFeaturedProducts(limit = 10) {
  return catalogService.getFeaturedProducts(limit).map(p => p.toJSON());
}

/**
 * Generates a unique user ID
 * @returns {string} User ID
 */
function generateUserId() {
  return 'USER-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generates a unique session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
  return 'SESS-' + Date.now() + '-' + Math.random().toString(36).substring(2, 12).toUpperCase();
}

/**
 * Gets application statistics (admin function)
 * @returns {object} Statistics
 */
export function getStatistics() {
  return {
    totalProducts: catalogService.getAllProducts(1, 10000).total,
    totalOrders: orderService.getOrderStatistics().totalOrders,
    totalRevenue: orderService.getOrderStatistics().totalRevenue,
    activeUsers: users.size,
    activeSessions: sessions.size
  };
}
