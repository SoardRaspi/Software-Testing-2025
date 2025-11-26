/**
 * User Model
 * Represents a user account with authentication and session management
 */

export class User {
  constructor(userId, email, name) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.createdAt = new Date();
    this.lastLogin = null;
    this.isActive = true;
    this.role = 'customer'; // customer, admin
    this.orderHistory = [];
  }

  /**
   * Updates last login timestamp
   */
  recordLogin() {
    this.lastLogin = new Date();
  }

  /**
   * Checks if user account is active
   * @returns {boolean} true if active
   */
  isAccountActive() {
    return this.isActive === true;
  }

  /**
   * Deactivates user account
   * @returns {boolean} true if successful
   */
  deactivateAccount() {
    if (!this.isActive) {
      return false; // Already deactivated
    }
    
    this.isActive = false;
    return true;
  }

  /**
   * Activates user account
   * @returns {boolean} true if successful
   */
  activateAccount() {
    if (this.isActive) {
      return false; // Already active
    }
    
    this.isActive = true;
    return true;
  }

  /**
   * Adds order to user's history
   * @param {string} orderId - Order identifier
   */
  addOrderToHistory(orderId) {
    if (orderId && !this.orderHistory.includes(orderId)) {
      this.orderHistory.push(orderId);
    }
  }

  /**
   * Checks if user has placed any orders
   * @returns {boolean} true if user has order history
   */
  hasOrderHistory() {
    return this.orderHistory.length > 0;
  }

  /**
   * Checks if user is an admin
   * @returns {boolean} true if admin role
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Converts user to plain object (without sensitive data)
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      isActive: this.isActive,
      role: this.role,
      orderHistory: this.orderHistory
    };
  }

  /**
   * Creates User from plain object
   * @param {object} data - Plain object with user data
   * @returns {User} User instance
   */
  static fromJSON(data) {
    const user = new User(data.userId, data.email, data.name);
    user.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    user.lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
    user.isActive = data.isActive !== undefined ? data.isActive : true;
    user.role = data.role || 'customer';
    user.orderHistory = data.orderHistory || [];
    return user;
  }
}
