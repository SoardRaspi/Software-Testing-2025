/**
 * Cart Model
 * Represents a shopping cart with items and calculations
 */

export class Cart {
  constructor(userId) {
    this.userId = userId;
    this.items = []; // Array of {productId, quantity, price, title}
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Adds an item to cart or updates quantity if already exists
   * @param {string} productId - Product identifier
   * @param {number} quantity - Quantity to add
   * @param {number} price - Unit price
   * @param {string} title - Product title
   * @returns {boolean} true if successful
   */
  addItem(productId, quantity, price, title) {
    // Validation with nested conditions
    if (!productId || typeof productId !== 'string') {
      return false;
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return false;
    }

    if (typeof price !== 'number' || price < 0) {
      return false;
    }

    // Check if item already exists in cart
    const existingItem = this.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update existing item quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      this.items.push({
        productId,
        quantity,
        price,
        title: title || 'Unknown Product'
      });
    }

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Removes an item from cart
   * @param {string} productId - Product to remove
   * @returns {boolean} true if item was found and removed
   */
  removeItem(productId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.productId !== productId);
    
    const removed = this.items.length < initialLength;
    if (removed) {
      this.updatedAt = new Date();
    }
    
    return removed;
  }

  /**
   * Updates quantity of an item in cart
   * @param {string} productId - Product to update
   * @param {number} newQuantity - New quantity (0 removes item)
   * @returns {boolean} true if successful
   */
  updateQuantity(productId, newQuantity) {
    // Complex validation logic
    if (typeof newQuantity !== 'number' || newQuantity < 0) {
      return false;
    }

    // If quantity is 0, remove the item
    if (newQuantity === 0) {
      return this.removeItem(productId);
    }

    const item = this.items.find(item => item.productId === productId);
    
    if (!item) {
      return false;
    }

    item.quantity = newQuantity;
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Gets item by product ID
   * @param {string} productId - Product identifier
   * @returns {object|null} Cart item or null
   */
  getItem(productId) {
    return this.items.find(item => item.productId === productId) || null;
  }

  /**
   * Calculates subtotal (sum of all items)
   * @returns {number} Subtotal amount
   */
  calculateSubtotal() {
    let subtotal = 0;
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      subtotal += item.price * item.quantity;
    }
    
    return Math.round(subtotal * 100) / 100;
  }

  /**
   * Gets total number of items in cart
   * @returns {number} Total item count
   */
  getTotalItems() {
    let total = 0;
    
    for (const item of this.items) {
      total += item.quantity;
    }
    
    return total;
  }

  /**
   * Checks if cart is empty
   * @returns {boolean} true if no items
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Clears all items from cart
   */
  clear() {
    this.items = [];
    this.updatedAt = new Date();
  }

  /**
   * Checks if cart total qualifies for free shipping
   * @param {number} threshold - Minimum amount for free shipping
   * @returns {boolean} true if qualifies
   */
  qualifiesForFreeShipping(threshold = 50) {
    // Nested logic for shipping qualification
    if (threshold <= 0) {
      return true; // If threshold is 0 or negative, always qualify
    }

    const subtotal = this.calculateSubtotal();
    
    if (subtotal >= threshold) {
      return true;
    }

    // Special case: if cart has more than 10 items, qualify regardless
    if (this.getTotalItems() >= 10) {
      return true;
    }

    return false;
  }

  /**
   * Validates cart items against available stock
   * @param {function} stockChecker - Function to check stock (productId, quantity)
   * @returns {object} Validation result {valid: boolean, issues: array}
   */
  validateStock(stockChecker) {
    const issues = [];

    // Iterate through items and check stock
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      if (typeof stockChecker !== 'function') {
        issues.push({
          productId: item.productId,
          message: 'Stock checker not available'
        });
        continue;
      }

      const hasStock = stockChecker(item.productId, item.quantity);
      
      if (!hasStock) {
        issues.push({
          productId: item.productId,
          title: item.title,
          message: 'Insufficient stock'
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Converts cart to plain object
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      userId: this.userId,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates Cart from plain object
   * @param {object} data - Plain object with cart data
   * @returns {Cart} Cart instance
   */
  static fromJSON(data) {
    const cart = new Cart(data.userId);
    cart.items = data.items || [];
    cart.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    cart.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    return cart;
  }
}
