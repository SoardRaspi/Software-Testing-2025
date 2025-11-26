/**
 * Product Model
 * Represents a book product in the catalog with validation and business logic
 */

export class Product {
  constructor(id, title, author, price, category, isbn, stock, description = '') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.price = price;
    this.category = category;
    this.isbn = isbn;
    this.stock = stock;
    this.description = description;
    this.createdAt = new Date();
  }

  /**
   * Checks if product is in stock
   * @returns {boolean} true if stock > 0
   */
  isInStock() {
    return this.stock > 0;
  }

  /**
   * Checks if product is low on stock (less than threshold)
   * @param {number} threshold - Stock level to compare against (default 5)
   * @returns {boolean} true if stock is below threshold
   */
  isLowStock(threshold = 5) {
    // Edge case: threshold must be positive
    if (threshold < 0) {
      threshold = 0;
    }
    return this.stock > 0 && this.stock <= threshold;
  }

  /**
   * Validates if product has sufficient stock for requested quantity
   * @param {number} quantity - Requested quantity
   * @returns {boolean} true if stock is sufficient
   */
  hasSufficientStock(quantity) {
    // Nested validation for edge cases
    if (typeof quantity !== 'number' || quantity < 0) {
      return false;
    }
    
    if (quantity === 0) {
      return true; // Zero quantity is always available
    }

    return this.stock >= quantity;
  }

  /**
   * Reduces stock by given quantity
   * @param {number} quantity - Amount to reduce
   * @returns {boolean} true if reduction successful
   */
  reduceStock(quantity) {
    // Complex validation with nested conditions
    if (!this.hasSufficientStock(quantity)) {
      return false;
    }

    if (quantity <= 0) {
      return false;
    }

    this.stock -= quantity;
    return true;
  }

  /**
   * Increases stock by given quantity
   * @param {number} quantity - Amount to add
   * @returns {boolean} true if increase successful
   */
  increaseStock(quantity) {
    // Validate quantity is positive
    if (typeof quantity !== 'number' || quantity <= 0) {
      return false;
    }

    this.stock += quantity;
    return true;
  }

  /**
   * Gets product display price with potential markup
   * @param {number} markup - Percentage markup (0-100)
   * @returns {number} Calculated price
   */
  getDisplayPrice(markup = 0) {
    // Nested conditionals for markup calculation
    if (markup < 0) {
      markup = 0;
    } else if (markup > 100) {
      markup = 100;
    }

    const finalPrice = this.price * (1 + markup / 100);
    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Determines if product qualifies for discount based on category and price
   * @returns {boolean} true if eligible for discount
   */
  isDiscountEligible() {
    // Complex business logic with multiple conditions
    const highValueThreshold = 50;
    const discountCategories = ['fiction', 'non-fiction', 'science'];

    // Nested if-else for eligibility
    if (this.price >= highValueThreshold) {
      if (discountCategories.includes(this.category.toLowerCase())) {
        return true;
      } else if (this.price >= 100) {
        // High-value items always eligible regardless of category
        return true;
      }
    }

    return false;
  }

  /**
   * Converts product to plain object for JSON serialization
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      price: this.price,
      category: this.category,
      isbn: this.isbn,
      stock: this.stock,
      description: this.description,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a Product instance from plain object
   * @param {object} data - Plain object with product data
   * @returns {Product} Product instance
   */
  static fromJSON(data) {
    const product = new Product(
      data.id,
      data.title,
      data.author,
      data.price,
      data.category,
      data.isbn,
      data.stock,
      data.description
    );
    
    if (data.createdAt) {
      product.createdAt = new Date(data.createdAt);
    }
    
    return product;
  }
}
