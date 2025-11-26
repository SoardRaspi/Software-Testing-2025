/**
 * Order Service
 * Handles order creation, validation, payment simulation, and order persistence
 */

import { Order } from '../models/order.js';
import { getCartSummary, validateCartStock, clearCart } from './cartService.js';
import { reserveStock, releaseStock } from './inventoryService.js';
import { validateAddress, validatePaymentMethod } from '../utils/validators.js';
import { calculateTax, calculateShipping, calculateFinalTotal } from '../utils/pricing.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory orders storage
const orders = [];

/**
 * Creates a new order from user's cart
 * @param {string} userId - User identifier
 * @param {object} orderDetails - Order details (shipping, payment, etc.)
 * @returns {Promise<object>} Order creation result
 */
export async function createOrder(userId, orderDetails) {
  // Comprehensive validation with nested conditions
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }

  if (!orderDetails || typeof orderDetails !== 'object') {
    return { success: false, message: 'Order details are required' };
  }

  // Validate shipping address
  const addressValidation = validateAddress(orderDetails.shippingAddress);
  if (!addressValidation.valid) {
    return {
      success: false,
      message: 'Invalid shipping address',
      errors: addressValidation.errors
    };
  }

  // Validate payment method
  if (!validatePaymentMethod(orderDetails.paymentMethod)) {
    return {
      success: false,
      message: 'Invalid payment method'
    };
  }

  // Get cart summary
  const cartSummary = getCartSummary(userId);

  if (!cartSummary || cartSummary.isEmpty) {
    return {
      success: false,
      message: 'Cannot create order from empty cart'
    };
  }

  // Validate stock availability
  const stockValidation = validateCartStock(userId);
  if (!stockValidation.valid) {
    return {
      success: false,
      message: 'Some items are out of stock',
      issues: stockValidation.issues
    };
  }

  // Generate order ID
  const orderId = generateOrderId();

  // Create order instance
  const order = new Order(orderId, userId, cartSummary.items);

  // Set shipping address
  if (!order.setShippingAddress(orderDetails.shippingAddress)) {
    return {
      success: false,
      message: 'Failed to set shipping address'
    };
  }

  // Set payment method
  if (!order.setPaymentMethod(orderDetails.paymentMethod, orderDetails.paymentDetails)) {
    return {
      success: false,
      message: 'Failed to set payment method'
    };
  }

  // Calculate totals with complex logic
  const taxRate = calculateTax(
    cartSummary.subtotal,
    orderDetails.shippingAddress.state || 'CA',
    ''
  ) / cartSummary.subtotal; // Get rate as decimal

  const shippingCost = calculateShipping(
    orderDetails.weight || 1,
    orderDetails.shippingZone || 'local',
    cartSummary.subtotal
  );

  order.calculateTotals(taxRate, shippingCost, cartSummary.discount);

  // Validate order is ready
  const orderValidation = order.validateForConfirmation();
  if (!orderValidation.valid) {
    return {
      success: false,
      message: 'Order validation failed',
      errors: orderValidation.errors
    };
  }

  // Reserve stock for all items
  const reservations = [];
  for (const item of order.items) {
    const reservation = reserveStock(item.productId, item.quantity);
    
    if (!reservation.success) {
      // Rollback previous reservations
      for (const prevReservation of reservations) {
        releaseStock(prevReservation.productId, prevReservation.quantity);
      }
      
      return {
        success: false,
        message: `Failed to reserve stock for ${item.title}`,
        details: reservation.message
      };
    }
    
    reservations.push({ productId: item.productId, quantity: item.quantity });
  }

  // Simulate payment processing
  const paymentResult = await processPayment(order, orderDetails.paymentMethod);

  if (!paymentResult.success) {
    // Release reserved stock on payment failure
    for (const reservation of reservations) {
      releaseStock(reservation.productId, reservation.quantity);
    }
    
    return {
      success: false,
      message: 'Payment processing failed',
      details: paymentResult.message
    };
  }

  // Confirm order
  order.updateStatus('confirmed');

  // Add to orders storage
  orders.push(order);

  // Save orders to file
  await saveOrders();

  // Clear user's cart
  clearCart(userId);

  return {
    success: true,
    message: 'Order created successfully',
    order: order.toJSON(),
    orderId: order.orderId
  };
}

/**
 * Simulates payment processing with complex validation
 * @param {Order} order - Order to process payment for
 * @param {string} paymentMethod - Payment method type
 * @returns {Promise<object>} Payment result
 */
async function processPayment(order, paymentMethod) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Complex validation logic
  if (!order || !order.total) {
    return { success: false, message: 'Invalid order' };
  }

  if (order.total <= 0) {
    return { success: false, message: 'Invalid order total' };
  }

  // Simulate different payment method behaviors
  if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
    // Simulate card validation
    if (order.total > 5000) {
      // High-value transactions need additional verification (simulated)
      return { success: true, message: 'Payment approved (verified)' };
    }
    return { success: true, message: 'Payment approved' };
  } else if (paymentMethod === 'paypal') {
    // PayPal always succeeds in simulation
    return { success: true, message: 'PayPal payment approved' };
  } else if (paymentMethod === 'cash_on_delivery') {
    // Cash on delivery doesn't process payment now
    return { success: true, message: 'Order placed (pay on delivery)' };
  } else {
    return { success: false, message: 'Unsupported payment method' };
  }
}

/**
 * Gets order by ID
 * @param {string} orderId - Order identifier
 * @returns {Order|null} Order or null
 */
export function getOrderById(orderId) {
  if (!orderId) {
    return null;
  }

  return orders.find(o => o.orderId === orderId) || null;
}

/**
 * Gets all orders for a user
 * @param {string} userId - User identifier
 * @param {object} options - Filter options
 * @returns {Array<Order>} User's orders
 */
export function getUserOrders(userId, options = {}) {
  if (!userId) {
    return [];
  }

  let userOrders = orders.filter(o => o.userId === userId);

  // Apply status filter with nested conditions
  if (options.status) {
    userOrders = userOrders.filter(o => o.status === options.status);
  }

  // Apply date filter
  if (options.fromDate) {
    const fromDate = new Date(options.fromDate);
    userOrders = userOrders.filter(o => o.createdAt >= fromDate);
  }

  if (options.toDate) {
    const toDate = new Date(options.toDate);
    userOrders = userOrders.filter(o => o.createdAt <= toDate);
  }

  // Sort by date (newest first)
  userOrders.sort((a, b) => b.createdAt - a.createdAt);

  // Apply limit
  if (options.limit && options.limit > 0) {
    userOrders = userOrders.slice(0, options.limit);
  }

  return userOrders;
}

/**
 * Cancels an order with validation
 * @param {string} orderId - Order to cancel
 * @param {string} userId - User requesting cancellation
 * @returns {object} Cancellation result
 */
export function cancelOrder(orderId, userId) {
  // Validation with nested conditions
  if (!orderId || !userId) {
    return { success: false, message: 'Order ID and User ID are required' };
  }

  const order = getOrderById(orderId);

  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  // Verify user owns the order
  if (order.userId !== userId) {
    return { success: false, message: 'Unauthorized: Order belongs to different user' };
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled()) {
    return {
      success: false,
      message: 'Order cannot be cancelled',
      reason: `Order is ${order.status}`
    };
  }

  // Update status
  const statusUpdated = order.updateStatus('cancelled');

  if (!statusUpdated) {
    return {
      success: false,
      message: 'Failed to update order status'
    };
  }

  // Release stock back to inventory
  for (const item of order.items) {
    releaseStock(item.productId, item.quantity);
  }

  // Save changes
  saveOrders();

  return {
    success: true,
    message: 'Order cancelled successfully',
    order: order.toJSON()
  };
}

/**
 * Updates order status (admin function)
 * @param {string} orderId - Order to update
 * @param {string} newStatus - New status
 * @returns {object} Update result
 */
export function updateOrderStatus(orderId, newStatus) {
  if (!orderId || !newStatus) {
    return { success: false, message: 'Order ID and status are required' };
  }

  const order = getOrderById(orderId);

  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  const updated = order.updateStatus(newStatus);

  if (updated) {
    saveOrders();
    return {
      success: true,
      message: 'Order status updated',
      newStatus: order.status
    };
  } else {
    return {
      success: false,
      message: 'Invalid status transition',
      currentStatus: order.status,
      attemptedStatus: newStatus
    };
  }
}

/**
 * Gets order statistics
 * @param {object} filters - Filters for statistics
 * @returns {object} Order statistics
 */
export function getOrderStatistics(filters = {}) {
  let filteredOrders = [...orders];

  // Apply filters with nested conditions
  if (filters.userId) {
    filteredOrders = filteredOrders.filter(o => o.userId === filters.userId);
  }

  if (filters.status) {
    filteredOrders = filteredOrders.filter(o => o.status === filters.status);
  }

  if (filters.fromDate) {
    const fromDate = new Date(filters.fromDate);
    filteredOrders = filteredOrders.filter(o => o.createdAt >= fromDate);
  }

  if (filters.toDate) {
    const toDate = new Date(filters.toDate);
    filteredOrders = filteredOrders.filter(o => o.createdAt <= toDate);
  }

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  let totalRevenue = 0;
  let totalItems = 0;

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  for (const order of filteredOrders) {
    totalRevenue += order.total;
    totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  }

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalItems,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    statusCounts
  };
}

/**
 * Generates a unique order ID
 * @returns {string} Order ID
 */
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Loads orders from JSON file
 * @returns {Promise<boolean>} true if successful
 */
export async function loadOrders() {
  try {
    const dataPath = path.join(__dirname, '../../data/orders.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const ordersData = JSON.parse(data);
    
    orders.length = 0; // Clear existing
    orders.push(...ordersData.map(o => Order.fromJSON(o)));
    
    return true;
  } catch (error) {
    // File might not exist yet, that's okay
    if (error.code !== 'ENOENT') {
      console.error('Failed to load orders:', error.message);
    }
    return false;
  }
}

/**
 * Saves orders to JSON file
 * @returns {Promise<boolean>} true if successful
 */
export async function saveOrders() {
  try {
    const dataPath = path.join(__dirname, '../../data/orders.json');
    const data = JSON.stringify(orders.map(o => o.toJSON()), null, 2);
    await fs.writeFile(dataPath, data, 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save orders:', error.message);
    return false;
  }
}
