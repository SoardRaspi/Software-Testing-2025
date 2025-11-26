/**
 * Order Model
 * Represents a customer order with items, pricing, and status tracking
 */

export class Order {
  constructor(orderId, userId, cartItems) {
    this.orderId = orderId;
    this.userId = userId;
    this.items = cartItems || [];
    this.status = 'pending'; // pending, confirmed, shipped, delivered, cancelled
    this.subtotal = 0;
    this.discount = 0;
    this.tax = 0;
    this.shipping = 0;
    this.total = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.shippingAddress = null;
    this.paymentMethod = null;
  }

  /**
   * Sets shipping address for order
   * @param {object} address - Address object with street, city, zip, country
   * @returns {boolean} true if address is valid
   */
  setShippingAddress(address) {
    // Validation with nested conditions
    if (!address || typeof address !== 'object') {
      return false;
    }

    // Check required fields
    if (!address.street || !address.city || !address.zip || !address.country) {
      return false;
    }

    this.shippingAddress = {
      street: address.street,
      city: address.city,
      zip: address.zip,
      country: address.country,
      state: address.state || ''
    };

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Sets payment method for order
   * @param {string} method - Payment method type
   * @param {object} details - Payment details
   * @returns {boolean} true if valid
   */
  setPaymentMethod(method, details = {}) {
    // Validate payment method
    const validMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'];
    
    if (!validMethods.includes(method)) {
      return false;
    }

    this.paymentMethod = {
      type: method,
      details: details
    };

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Calculates order totals including tax and shipping
   * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
   * @param {number} shippingCost - Shipping cost
   * @param {number} discountAmount - Discount amount
   */
  calculateTotals(taxRate = 0, shippingCost = 0, discountAmount = 0) {
    // Calculate subtotal from items
    this.subtotal = 0;
    for (const item of this.items) {
      this.subtotal += item.price * item.quantity;
    }
    this.subtotal = Math.round(this.subtotal * 100) / 100;

    // Apply discount with validation
    if (discountAmount < 0) {
      discountAmount = 0;
    } else if (discountAmount > this.subtotal) {
      discountAmount = this.subtotal;
    }
    this.discount = Math.round(discountAmount * 100) / 100;

    // Calculate tax on discounted amount
    const taxableAmount = this.subtotal - this.discount;
    if (taxRate < 0) {
      taxRate = 0;
    } else if (taxRate > 1) {
      taxRate = 1; // Cap at 100%
    }
    this.tax = Math.round(taxableAmount * taxRate * 100) / 100;

    // Set shipping cost
    if (shippingCost < 0) {
      shippingCost = 0;
    }
    this.shipping = Math.round(shippingCost * 100) / 100;

    // Calculate final total
    this.total = this.subtotal - this.discount + this.tax + this.shipping;
    this.total = Math.round(this.total * 100) / 100;

    this.updatedAt = new Date();
  }

  /**
   * Updates order status with validation
   * @param {string} newStatus - New status value
   * @returns {boolean} true if transition is valid
   */
  updateStatus(newStatus) {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      return false;
    }

    // Define valid state transitions
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [], // Terminal state
      'cancelled': [] // Terminal state
    };

    // Check if transition is allowed
    const allowedTransitions = validTransitions[this.status];
    
    if (!allowedTransitions.includes(newStatus)) {
      return false;
    }

    this.status = newStatus;
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Checks if order can be cancelled
   * @returns {boolean} true if cancellation is allowed
   */
  canBeCancelled() {
    // Complex logic with multiple conditions
    if (this.status === 'cancelled') {
      return false; // Already cancelled
    }

    if (this.status === 'delivered') {
      return false; // Cannot cancel delivered orders
    }

    // Check if order is too old (more than 24 hours)
    const hoursSinceCreation = (new Date() - this.createdAt) / (1000 * 60 * 60);
    
    if (this.status === 'shipped' && hoursSinceCreation > 24) {
      return false; // Cannot cancel shipped orders after 24 hours
    }

    return true;
  }

  /**
   * Validates if order is ready for confirmation
   * @returns {object} Validation result {valid: boolean, errors: array}
   */
  validateForConfirmation() {
    const errors = [];

    // Check items
    if (!this.items || this.items.length === 0) {
      errors.push('Order must have at least one item');
    }

    // Check shipping address
    if (!this.shippingAddress) {
      errors.push('Shipping address is required');
    }

    // Check payment method
    if (!this.paymentMethod) {
      errors.push('Payment method is required');
    }

    // Check totals have been calculated
    if (this.total === 0 && this.items.length > 0) {
      errors.push('Order totals not calculated');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if order qualifies for express shipping
   * @returns {boolean} true if eligible
   */
  isExpressShippingEligible() {
    // Multiple nested conditions for eligibility
    if (this.status !== 'pending' && this.status !== 'confirmed') {
      return false;
    }

    // High value orders qualify
    if (this.subtotal >= 100) {
      return true;
    }

    // Check if shipping address is domestic
    if (this.shippingAddress && this.shippingAddress.country === 'US') {
      // Domestic orders over $50 qualify
      if (this.subtotal >= 50) {
        return true;
      }
    }

    return false;
  }

  /**
   * Converts order to plain object
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      orderId: this.orderId,
      userId: this.userId,
      items: this.items,
      status: this.status,
      subtotal: this.subtotal,
      discount: this.discount,
      tax: this.tax,
      shipping: this.shipping,
      total: this.total,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod
    };
  }

  /**
   * Creates Order from plain object
   * @param {object} data - Plain object with order data
   * @returns {Order} Order instance
   */
  static fromJSON(data) {
    const order = new Order(data.orderId, data.userId, data.items);
    order.status = data.status || 'pending';
    order.subtotal = data.subtotal || 0;
    order.discount = data.discount || 0;
    order.tax = data.tax || 0;
    order.shipping = data.shipping || 0;
    order.total = data.total || 0;
    order.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    order.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    order.shippingAddress = data.shippingAddress || null;
    order.paymentMethod = data.paymentMethod || null;
    return order;
  }
}
