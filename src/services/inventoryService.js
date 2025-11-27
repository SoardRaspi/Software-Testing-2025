/**
 * Inventory Service
 * Handles stock management, restock operations, and inventory tracking
 */

import { getProductById, updateProduct } from './catalogService.js';
import { validateQuantity } from '../utils/validators.js';

// Inventory transaction log
const inventoryLog = [];

/**
 * Checks if product has sufficient stock
 * @param {string} productId - Product to check
 * @param {number} quantity - Required quantity
 * @returns {object} Stock check result
 */
export function checkStock(productId, quantity) {
  const product = getProductById(productId);

  if (!product) {
    return {
      available: false,
      message: 'Product not found',
      currentStock: 0
    };
  }

  const hasStock = product.hasSufficientStock(quantity);

  return {
    available: hasStock,
    message: hasStock ? 'Stock available' : 'Insufficient stock',
    currentStock: product.stock,
    requested: quantity
  };
}

/**
 * Reserves stock for an order (reduces stock level)
 * @param {string} productId - Product to reserve
 * @param {number} quantity - Quantity to reserve
 * @returns {object} Reservation result
 */
export function reserveStock(productId, quantity) {
  // Validation with nested conditions
  if (!productId) {
    return { success: false, message: 'Product ID required' };
  }

  const quantityValidation = validateQuantity(quantity);
  if (!quantityValidation.valid) {
    return { success: false, message: quantityValidation.error };
  }

  const product = getProductById(productId);

  if (!product) {
    return { success: false, message: 'Product not found' };
  }

  // Check stock availability
  if (!product.hasSufficientStock(quantity)) {
    return {
      success: false,
      message: `Insufficient stock. Available: ${product.stock}`,
      available: product.stock
    };
  }

  // Reduce stock
  const reduced = product.reduceStock(quantity);

  if (reduced) {
    // Log transaction
    logInventoryTransaction(productId, -quantity, 'reserve', {
      previousStock: product.stock + quantity,
      newStock: product.stock
    });

    return {
      success: true,
      message: 'Stock reserved',
      newStock: product.stock
    };
  } else {
    return {
      success: false,
      message: 'Failed to reserve stock'
    };
  }
}

/**
 * Releases reserved stock (adds back to stock)
 * @param {string} productId - Product to release
 * @param {number} quantity - Quantity to release
 * @returns {object} Release result
 */
export function releaseStock(productId, quantity) {
  if (!productId) {
    return { success: false, message: 'Product ID required' };
  }

  const quantityValidation = validateQuantity(quantity);
  if (!quantityValidation.valid) {
    return { success: false, message: quantityValidation.error };
  }

  const product = getProductById(productId);

  if (!product) {
    return { success: false, message: 'Product not found' };
  }

  // Add stock back
  const increased = product.increaseStock(quantity);

  if (increased) {
    logInventoryTransaction(productId, quantity, 'release', {
      previousStock: product.stock - quantity,
      newStock: product.stock
    });

    return {
      success: true,
      message: 'Stock released',
      newStock: product.stock
    };
  } else {
    return {
      success: false,
      message: 'Failed to release stock'
    };
  }
}

/**
 * Restocks a product with complex validation logic
 * @param {string} productId - Product to restock
 * @param {number} quantity - Quantity to add
 * @param {object} options - Restock options
 * @returns {object} Restock result
 */
export function restockProduct(productId, quantity, options = {}) {
  // Nested validation
  if (!productId) {
    return { success: false, message: 'Product ID required' };
  }

  const quantityValidation = validateQuantity(quantity);
  if (!quantityValidation.valid) {
    return { success: false, message: quantityValidation.error };
  }

  const product = getProductById(productId);

  if (!product) {
    return { success: false, message: 'Product not found' };
  }

  const { maxStock = 1000, autoAdjust = false } = options;

  let finalQuantity = quantity;

  // Check maximum stock level
  if (product.stock + quantity > maxStock) {
    if (autoAdjust) {
      // Adjust to max stock level
      finalQuantity = maxStock - product.stock;
      
      if (finalQuantity <= 0) {
        return {
          success: false,
          message: 'Product already at maximum stock level'
        };
      }
    } else {
      return {
        success: false,
        message: `Restocking would exceed maximum stock level (${maxStock})`
      };
    }
  }

  const increased = product.increaseStock(finalQuantity);

  if (increased) {
    logInventoryTransaction(productId, finalQuantity, 'restock', {
      previousStock: product.stock - finalQuantity,
      newStock: product.stock,
      adjusted: autoAdjust && finalQuantity !== quantity
    });

    return {
      success: true,
      message: 'Product restocked',
      addedQuantity: finalQuantity,
      newStock: product.stock,
      adjusted: autoAdjust && finalQuantity !== quantity
    };
  } else {
    return {
      success: false,
      message: 'Failed to restock product'
    };
  }
}

/**
 * Gets low stock products with complex filtering
 * @param {number} threshold - Stock level threshold
 * @param {object} options - Filter options
 * @returns {Array} Low stock products
 */
export function getLowStockProducts(threshold = 5, options = {}) {
  // Validate threshold
  if (typeof threshold !== 'number' || threshold < 0) {
    threshold = 5;
  }

  const { category = null, sortBy = 'stock', excludeOutOfStock = false } = options;

  // Get all products from catalog (assuming we have access)
  // In real implementation, would import from catalogService
  const products = [];
  
  // Filter with nested conditions
  const lowStock = products.filter(product => {
    // Check stock level
    if (excludeOutOfStock && product.stock === 0) {
      return false;
    }

    if (!product.isLowStock(threshold)) {
      return false;
    }

    // Check category filter if provided
    if (category && product.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Sort results
  if (sortBy === 'stock') {
    lowStock.sort((a, b) => a.stock - b.stock);
  } else if (sortBy === 'title') {
    lowStock.sort((a, b) => a.title.localeCompare(b.title));
  }

  return lowStock;
}

/**
 * Performs bulk restock operation
 * @param {Array} restockList - List of {productId, quantity}
 * @param {object} options - Bulk options
 * @returns {object} Bulk operation result
 */
export function bulkRestock(restockList, options = {}) {
  if (!Array.isArray(restockList) || restockList.length === 0) {
    return {
      success: false,
      message: 'Restock list is empty or invalid',
      results: []
    };
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  // Process each restock request
  for (let i = 0; i < restockList.length; i++) {
    const item = restockList[i];

    // Validate item structure
    if (!item || !item.productId || typeof item.quantity !== 'number') {
      results.push({
        productId: item?.productId || 'unknown',
        success: false,
        message: 'Invalid restock item structure'
      });
      failCount++;
      continue;
    }

    const result = restockProduct(item.productId, item.quantity, options);
    results.push({
      productId: item.productId,
      success: result.success,
      message: result.message,
      newStock: result.newStock
    });

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  return {
    success: successCount > 0,
    message: `Restocked ${successCount} products, ${failCount} failed`,
    successCount,
    failCount,
    results
  };
}

/**
 * Adjusts stock level directly (for corrections)
 * @param {string} productId - Product to adjust
 * @param {number} newStock - New stock level
 * @param {string} reason - Reason for adjustment
 * @returns {object} Adjustment result
 */
export function adjustStockLevel(productId, newStock, reason = '') {
  // Validation with nested conditions
  if (!productId) {
    return { success: false, message: 'Product ID required' };
  }

  if (typeof newStock !== 'number' || newStock < 0) {
    return { success: false, message: 'Invalid stock level' };
  }

  const product = getProductById(productId);

  if (!product) {
    return { success: false, message: 'Product not found' };
  }

  const previousStock = product.stock;
  const difference = newStock - previousStock;

  // Update stock
  const updated = updateProduct(productId, { stock: newStock });

  if (updated) {
    logInventoryTransaction(productId, difference, 'adjustment', {
      previousStock,
      newStock,
      reason: reason || 'Manual adjustment'
    });

    return {
      success: true,
      message: 'Stock level adjusted',
      previousStock,
      newStock,
      difference
    };
  } else {
    return {
      success: false,
      message: 'Failed to adjust stock level'
    };
  }
}

/**
 * Logs an inventory transaction
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity change (negative for reduction)
 * @param {string} type - Transaction type
 * @param {object} details - Additional details
 */
function logInventoryTransaction(productId, quantity, type, details = {}) {
  const transaction = {
    productId,
    quantity,
    type,
    timestamp: new Date(),
    details
  };

  inventoryLog.push(transaction);

  // Keep log size manageable (last 1000 transactions)
  if (inventoryLog.length > 1000) {
    inventoryLog.shift();
  }
}

/**
 * Gets inventory transaction history
 * @param {string} productId - Product ID (optional, null for all)
 * @param {number} limit - Maximum transactions to return
 * @returns {Array} Transaction history
 */
export function getInventoryHistory(productId = null, limit = 50) {
  let history = [...inventoryLog];

  // Filter by product if specified
  if (productId) {
    history = history.filter(t => t.productId === productId);
  }

  // Sort by timestamp (newest first)
  history.sort((a, b) => b.timestamp - a.timestamp);

  // Apply limit
  if (limit > 0) {
    history = history.slice(0, limit);
  }

  return history;
}

/**
 * Calculates inventory value
 * @param {Array} products - Products to calculate (optional)
 * @returns {object} Inventory value breakdown
 */
export function calculateInventoryValue(products = []) {
  if (products.length === 0) {
    return {
      totalValue: 0,
      totalItems: 0,
      averageValue: 0
    };
  }

  let totalValue = 0;
  let totalItems = 0;

  // Calculate with nested operations
  for (const product of products) {
    if (product.stock > 0) {
      const productValue = product.price * product.stock;
      totalValue += productValue;
      totalItems += product.stock;
    }
  }

  const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalItems,
    averageValue: Math.round(averageValue * 100) / 100
  };
}

/**
 * Gets inventory log
 * @returns {Array} Transaction log
 */
export function getInventoryLog() {
  return [...inventoryLog];
}

/**
 * Clears inventory log
 */
export function clearInventoryLog() {
  inventoryLog.length = 0;
}

/**
 * Gets stock level for a product
 * @param {string} productId - Product ID
 * @returns {object|null} Stock information
 */
export function getStockLevel(productId) {
  const product = getProductById(productId);
  if (!product) {
    return null;
  }
  
  return {
    productId: product.id,
    title: product.title,
    stock: product.stock
  };
}

/**
 * Gets stock value for a product
 * @param {string} productId - Product ID
 * @returns {object|null} Stock value information
 */
export function getStockValue(productId) {
  const product = getProductById(productId);
  if (!product) {
    return null;
  }
  
  const totalValue = Math.round(product.price * product.stock * 100) / 100;
  
  return {
    productId: product.id,
    stock: product.stock,
    pricePerUnit: product.price,
    totalValue
  };
}

/**
 * Gets total inventory value
 * @param {object} options - Options
 * @returns {object} Total value information
 */
export function getTotalInventoryValue(options = {}) {
  const { includeBreakdown = false } = options;
  
  // This would need access to all products from catalogService
  // For now, return a basic structure
  let totalValue = 0;
  let productCount = 0;
  let totalUnits = 0;
  const breakdown = {};
  
  return {
    totalValue,
    productCount,
    totalUnits,
    breakdown: includeBreakdown ? breakdown : undefined
  };
}
