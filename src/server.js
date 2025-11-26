/**
 * Express Server
 * HTTP server with REST API endpoints
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const PORT = process.env.PORT || 4000;

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, '../client')));

// CORS headers for development
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Session-ID');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ===== Authentication Endpoints =====

/**
 * POST /api/auth/login
 * Creates a user session (simulated login)
 */
server.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email and name are required'
    });
  }

  const session = app.createUserSession(email, name);

  res.json({
    success: true,
    message: 'Logged in successfully',
    sessionId: session.sessionId,
    user: session.user
  });
});

/**
 * POST /api/auth/logout
 * Ends a user session
 */
server.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['session-id'];

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID required'
    });
  }

  app.endSession(sessionId);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ===== Catalog Endpoints =====

/**
 * GET /api/catalog
 * Gets product catalog with optional filters and pagination
 */
server.get('/api/catalog', (req, res) => {
  const params = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    sortBy: req.query.sortBy,
    order: req.query.order
  };

  const catalog = app.getCatalog(params);

  res.json({
    success: true,
    ...catalog
  });
});

/**
 * GET /api/catalog/:productId
 * Gets product details by ID
 */
server.get('/api/catalog/:productId', (req, res) => {
  const { productId } = req.params;

  const productDetails = app.getProductDetails(productId);

  if (!productDetails) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    ...productDetails
  });
});

/**
 * GET /api/catalog/featured
 * Gets featured products
 */
server.get('/api/featured', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const featured = app.getFeaturedProducts(limit);

  res.json({
    success: true,
    products: featured,
    count: featured.length
  });
});

// ===== Cart Endpoints =====

/**
 * GET /api/cart
 * Gets user's cart
 */
server.get('/api/cart', (req, res) => {
  const sessionId = req.headers['session-id'];

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const cart = app.getUserCart(sessionId);

  if (!cart) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }

  res.json({
    success: true,
    cart
  });
});

/**
 * POST /api/cart/add
 * Adds item to cart
 */
server.post('/api/cart/add', (req, res) => {
  const sessionId = req.headers['session-id'];
  const { productId, quantity } = req.body;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID required'
    });
  }

  const result = app.handleAddToCart(sessionId, productId, quantity || 1);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * POST /api/cart/remove
 * Removes item from cart
 */
server.post('/api/cart/remove', (req, res) => {
  const sessionId = req.headers['session-id'];
  const { productId } = req.body;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const result = app.handleRemoveFromCart(sessionId, productId);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * PUT /api/cart/update
 * Updates item quantity in cart
 */
server.put('/api/cart/update', (req, res) => {
  const sessionId = req.headers['session-id'];
  const { productId, quantity } = req.body;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const result = app.handleUpdateCartQuantity(sessionId, productId, quantity);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// ===== Order Endpoints =====

/**
 * POST /api/orders/checkout
 * Creates an order from cart
 */
server.post('/api/orders/checkout', async (req, res) => {
  const sessionId = req.headers['session-id'];
  const orderDetails = req.body;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const result = await app.handleCheckout(sessionId, orderDetails);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * GET /api/orders
 * Gets user's orders
 */
server.get('/api/orders', (req, res) => {
  const sessionId = req.headers['session-id'];

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const orders = app.getUserOrders(sessionId, {
    status: req.query.status,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined
  });

  if (!orders) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }

  res.json({
    success: true,
    orders,
    count: orders.length
  });
});

/**
 * GET /api/orders/:orderId
 * Gets order details
 */
server.get('/api/orders/:orderId', (req, res) => {
  const sessionId = req.headers['session-id'];
  const { orderId } = req.params;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const order = app.getOrderDetails(sessionId, orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found or unauthorized'
    });
  }

  res.json({
    success: true,
    order
  });
});

/**
 * POST /api/orders/:orderId/cancel
 * Cancels an order
 */
server.post('/api/orders/:orderId/cancel', (req, res) => {
  const sessionId = req.headers['session-id'];
  const { orderId } = req.params;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID required'
    });
  }

  const result = app.handleCancelOrder(sessionId, orderId);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// ===== Statistics Endpoint (Admin) =====

/**
 * GET /api/stats
 * Gets application statistics
 */
server.get('/api/stats', (req, res) => {
  const stats = app.getStatistics();

  res.json({
    success: true,
    statistics: stats
  });
});

// ===== Health Check =====

/**
 * GET /api/health
 * Health check endpoint
 */
server.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 Handler =====

server.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ===== Error Handler =====

server.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ===== Start Server =====

async function start() {
  // Initialize application
  await app.initialize();

  // Start listening
  server.listen(PORT, () => {
    console.log(`\n🚀 Mini Online Bookstore Server`);
    console.log(`📚 Server running on http://localhost:${PORT}`);
    console.log(`📖 Catalog: http://localhost:${PORT}/index.html`);
    console.log(`🛒 Cart: http://localhost:${PORT}/cart.html`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  GET  /api/catalog - Browse products`);
    console.log(`  GET  /api/cart - View cart`);
    console.log(`  POST /api/cart/add - Add to cart`);
    console.log(`  POST /api/orders/checkout - Place order`);
    console.log(`  GET  /api/health - Health check\n`);
  });
}

start().catch(console.error);

export default server;
