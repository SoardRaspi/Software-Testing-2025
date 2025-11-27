/**
 * Order Service
 * Handles order operations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory order storage
let orders = [];

/**
 * Loads orders from JSON file
 * @returns {Promise<boolean>} true if successful
 */
export async function loadOrders() {
  try {
    const dataPath = path.join(__dirname, '../../data/orders.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    orders = JSON.parse(data);
    return true;
  } catch (error) {
    console.error('Failed to load orders:', error.message);
    orders = [];
    return false;
  }
}

/**
 * Gets order statistics
 * @returns {object} Order statistics
 */
export function getOrderStatistics() {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100
  };
}

/**
 * Gets all orders
 * @returns {Array} All orders
 */
export function getAllOrders() {
  return [...orders];
}

/**
 * Creates a new order
 * @param {object} orderData - Order data
 * @returns {object} Created order
 */
export function createOrder(orderData) {
  const order = {
    id: `order-${Date.now()}`,
    ...orderData,
    createdAt: new Date(),
    status: 'pending'
  };
  
  orders.push(order);
  return order;
}

/**
 * Gets order by ID
 * @param {string} orderId - Order ID
 * @returns {object|null} Order or null
 */
export function getOrderById(orderId) {
  return orders.find(o => o.id === orderId) || null;
}
