/**
 * Cart Service
 * Manages shopping cart operations, totals computation, and discount application
 */

import { Cart } from '../models/cart.js';
import { validateQuantity } from '../utils/validators.js';
import { calculateDiscount, getDiscountTier } from '../utils/pricing.js';
import { getProductById } from './catalogService.js';

// In-memory cart storage (keyed by userId)
const carts = new Map();

/**
 * Gets or creates a cart for a user
 * @param {string} userId - User identifier
 * @returns {Cart} User's cart
 */
export function getCart(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!carts.has(userId)) {
    carts.set(userId, new Cart(userId));
  }

  return carts.get(userId);
}

/**
 * Adds item to user's cart with validation
 * @param {string} userId - User identifier
 * @param {string} productId - Product to add
 * @param {number} quantity - Quantity to add
 * @returns {object} Result {success: boolean, message: string, cart: Cart}
 */
export function addToCart(userId, productId, quantity = 1) {
  // Validate inputs with nested conditions
  if (!userId) {
    return { success: false, message: 'User ID is required', cart: null };
  }

  if (!productId) {
    return { success: false, message: 'Product ID is required', cart: null };
  }

  // Validate quantity
  const quantityValidation = validateQuantity(quantity);
  if (!quantityValidation.valid) {
    return { success: false, message: quantityValidation.error, cart: null };
  }

  // Get product details
  const product = getProductById(productId);
  if (!product) {
    return { success: false, message: 'Product not found', cart: null };
  }

  // Check stock availability with nested conditions
  if (!product.isInStock()) {
    return { success: false, message: 'Product is out of stock', cart: null };
  }

  if (!product.hasSufficientStock(quantity)) {
    return { 
      success: false, 
      message: `Only ${product.stock} items available in stock`, 
      cart: null 
    };
  }

  // Get or create cart
  const cart = getCart(userId);

  // Check if adding would exceed stock
  const existingItem = cart.getItem(productId);
  const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (totalQuantity > product.stock) {
    return {
      success: false,
      message: `Cannot add ${quantity} more. Total would exceed available stock`,
      cart: null
    };
  }

  // Add item to cart
  const added = cart.addItem(productId, quantity, product.price, product.title);

  if (added) {
    return { success: true, message: 'Item added to cart', cart };
  } else {
    return { success: false, message: 'Failed to add item to cart', cart: null };
  }
}

/**
 * Removes item from cart
 * @param {string} userId - User identifier
 * @param {string} productId - Product to remove
 * @returns {object} Result object
 */
export function removeFromCart(userId, productId) {
  if (!userId || !productId) {
    return { success: false, message: 'User ID and Product ID are required' };
  }

  const cart = getCart(userId);
  const removed = cart.removeItem(productId);

  if (removed) {
    return { success: true, message: 'Item removed from cart', cart };
  } else {
    return { success: false, message: 'Item not found in cart', cart: null };
  }
}

/**
 * Updates item quantity in cart
 * @param {string} userId - User identifier
 * @param {string} productId - Product to update
 * @param {number} newQuantity - New quantity
 * @returns {object} Result object
 */
export function updateCartQuantity(userId, productId, newQuantity) {
  // Complex validation with nested conditions
  if (!userId || !productId) {
    return { success: false, message: 'User ID and Product ID are required' };
  }

  const quantityValidation = validateQuantity(newQuantity, { min: 0 });
  if (!quantityValidation.valid) {
    return { success: false, message: quantityValidation.error };
  }

  const cart = getCart(userId);

  // Check stock if increasing quantity
  if (newQuantity > 0) {
    const product = getProductById(productId);
    
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    if (newQuantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} items available`
      };
    }
  }

  const updated = cart.updateQuantity(productId, newQuantity);

  if (updated) {
    const message = newQuantity === 0 ? 'Item removed from cart' : 'Quantity updated';
    return { success: true, message, cart };
  } else {
    return { success: false, message: 'Failed to update quantity' };
  }
}

/**
 * Calculates cart totals with discounts
 * @param {string} userId - User identifier
 * @param {object} discountOptions - Discount options
 * @returns {object} Cart totals breakdown
 */
export function calculateCartTotals(userId, discountOptions = {}) {
  if (!userId) {
    return null;
  }

  const cart = getCart(userId);

  if (cart.isEmpty()) {
    return {
      subtotal: 0,
      discount: 0,
      discountType: 'none',
      finalTotal: 0,
      itemCount: 0
    };
  }

  const subtotal = cart.calculateSubtotal();
  let discount = 0;
  let discountType = 'none';

  // Apply automatic tier discount if no code provided
  if (!discountOptions.code) {
    const tier = getDiscountTier(subtotal);
    
    if (tier.percentage > 0) {
      discount = calculateDiscount(subtotal, 'percentage', tier.percentage);
      discountType = `tier-${tier.name}`;
    }
  } else {
    // Apply discount code (simplified - in real app would validate against database)
    const code = discountOptions.code.toUpperCase();
    
    // Nested discount code logic
    if (code === 'SAVE10') {
      if (subtotal >= 30) {
        discount = calculateDiscount(subtotal, 'percentage', 10);
        discountType = 'code-SAVE10';
      }
    } else if (code === 'SAVE20') {
      if (subtotal >= 50) {
        discount = calculateDiscount(subtotal, 'percentage', 20);
        discountType = 'code-SAVE20';
      }
    } else if (code === 'FLAT15') {
      discount = calculateDiscount(subtotal, 'fixed', 15);
      discountType = 'code-FLAT15';
    }
  }

  const finalTotal = subtotal - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    discountType,
    finalTotal: Math.round(finalTotal * 100) / 100,
    itemCount: cart.getTotalItems()
  };
}

/**
 * Validates cart against current stock levels
 * @param {string} userId - User identifier
 * @returns {object} Validation result
 */
export function validateCartStock(userId) {
  if (!userId) {
    return { valid: false, issues: ['User ID required'] };
  }

  const cart = getCart(userId);

  if (cart.isEmpty()) {
    return { valid: false, issues: ['Cart is empty'] };
  }

  // Stock checker function
  const stockChecker = (productId, quantity) => {
    const product = getProductById(productId);
    
    if (!product) {
      return false;
    }

    return product.hasSufficientStock(quantity);
  };

  return cart.validateStock(stockChecker);
}

/**
 * Clears user's cart
 * @param {string} userId - User identifier
 * @returns {boolean} true if successful
 */
export function clearCart(userId) {
  if (!userId) {
    return false;
  }

  const cart = getCart(userId);
  cart.clear();
  return true;
}

/**
 * Gets cart summary with formatted data
 * @param {string} userId - User identifier
 * @returns {object} Cart summary
 */
export function getCartSummary(userId) {
  if (!userId) {
    return null;
  }

  const cart = getCart(userId);
  const totals = calculateCartTotals(userId);

  return {
    userId: cart.userId,
    items: cart.items,
    itemCount: cart.getTotalItems(),
    isEmpty: cart.isEmpty(),
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.finalTotal,
    qualifiesForFreeShipping: cart.qualifiesForFreeShipping(),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
}

/**
 * Merges a guest cart into user cart after login
 * @param {string} guestId - Guest identifier
 * @param {string} userId - User identifier
 * @returns {object} Merge result
 */
export function mergeGuestCart(guestId, userId) {
  // Validation
  if (!guestId || !userId) {
    return { success: false, message: 'Both IDs required' };
  }

  if (guestId === userId) {
    return { success: false, message: 'Cannot merge same cart' };
  }

  const guestCart = carts.get(guestId);
  
  if (!guestCart || guestCart.isEmpty()) {
    return { success: true, message: 'No guest cart to merge' };
  }

  const userCart = getCart(userId);
  let mergedCount = 0;
  let failedItems = [];

  // Iterate through guest cart items
  for (const item of guestCart.items) {
    const result = addToCart(userId, item.productId, item.quantity);
    
    if (result.success) {
      mergedCount++;
    } else {
      failedItems.push({
        productId: item.productId,
        reason: result.message
      });
    }
  }

  // Clear guest cart
  carts.delete(guestId);

  return {
    success: true,
    message: `Merged ${mergedCount} items`,
    mergedCount,
    failedItems,
    cart: userCart
  };
}

/**
 * Applies bulk operation to cart items
 * @param {string} userId - User identifier
 * @param {string} operation - Operation: 'increase', 'decrease', 'clear_low_stock'
 * @param {object} options - Operation options
 * @returns {object} Operation result
 */
export function bulkCartOperation(userId, operation, options = {}) {
  if (!userId) {
    return { success: false, message: 'User ID required' };
  }

  const cart = getCart(userId);

  if (cart.isEmpty()) {
    return { success: false, message: 'Cart is empty' };
  }

  let affectedCount = 0;

  // Complex nested operations
  if (operation === 'increase') {
    const amount = options.amount || 1;
    
    for (const item of cart.items) {
      const product = getProductById(item.productId);
      const newQuantity = item.quantity + amount;
      
      if (product && product.hasSufficientStock(newQuantity)) {
        if (cart.updateQuantity(item.productId, newQuantity)) {
          affectedCount++;
        }
      }
    }
  } else if (operation === 'decrease') {
    const amount = options.amount || 1;
    
    for (const item of cart.items) {
      const newQuantity = Math.max(0, item.quantity - amount);
      if (cart.updateQuantity(item.productId, newQuantity)) {
        affectedCount++;
      }
    }
  } else if (operation === 'clear_low_stock') {
    const items = [...cart.items]; // Copy to avoid mutation during iteration
    
    for (const item of items) {
      const product = getProductById(item.productId);
      
      if (product && product.isLowStock(5)) {
        if (cart.removeItem(item.productId)) {
          affectedCount++;
        }
      }
    }
  } else {
    return { success: false, message: 'Invalid operation' };
  }

  return {
    success: true,
    message: `Operation completed on ${affectedCount} items`,
    affectedCount,
    cart
  };
}
