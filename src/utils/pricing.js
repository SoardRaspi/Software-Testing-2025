/**
 * Pricing Utility Module
 * Contains complex pricing logic, discount calculations, and tax computations
 * Designed with rich branching for mutation testing
 */

/**
 * Calculates discount amount based on discount type and value
 * @param {number} subtotal - Original subtotal amount
 * @param {string} discountType - Type: 'percentage' or 'fixed'
 * @param {number} discountValue - Discount value
 * @returns {number} Discount amount
 */
export function calculateDiscount(subtotal, discountType, discountValue) {
  // Validation with nested conditions
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return 0;
  }

  if (!discountType || typeof discountType !== 'string') {
    return 0;
  }

  if (typeof discountValue !== 'number' || discountValue < 0) {
    return 0;
  }

  let discountAmount = 0;

  if (discountType === 'percentage') {
    // Percentage discount with capping
    if (discountValue > 100) {
      discountValue = 100; // Cap at 100%
    }
    
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    // Fixed amount discount
    discountAmount = discountValue;
    
    // Cannot exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  } else {
    return 0; // Invalid discount type
  }

  // Round to 2 decimal places
  return Math.round(discountAmount * 100) / 100;
}

/**
 * Determines discount tier based on subtotal amount
 * Complex nested logic for mutation testing
 * @param {number} subtotal - Subtotal amount
 * @returns {object} Discount tier info {percentage, minPurchase, name}
 */
export function getDiscountTier(subtotal) {
  // Multiple threshold checks with nested conditions
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return 0;
  }

  // Nested if-else chain for different tiers
  if (subtotal >= 1000) {
    return 0.25;
  } else if (subtotal >= 500) {
    return 0.20;
  } else if (subtotal >= 200) {
    return 0.15;
  } else if (subtotal >= 100) {
    return 0.10;
  } else if (subtotal >= 50) {
    return 0.05;
  } else {
    return 0;
  }
}

/**
 * Gets discount tier info object
 * @param {number} subtotal - Subtotal amount
 * @returns {object} Discount tier info
 */
export function getDiscountTierInfo(subtotal) {
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return { percentage: 0, minPurchase: 0, name: 'none' };
  }

  if (subtotal >= 200) {
    return { percentage: 20, minPurchase: 200, name: 'platinum' };
  } else if (subtotal >= 150) {
    return { percentage: 15, minPurchase: 150, name: 'gold' };
  } else if (subtotal >= 100) {
    return { percentage: 10, minPurchase: 100, name: 'silver' };
  } else if (subtotal >= 50) {
    return { percentage: 5, minPurchase: 50, name: 'bronze' };
  } else {
    return { percentage: 0, minPurchase: 0, name: 'none' };
  }
}

/**
 * Calculates shipping cost based on weight, distance, and subtotal
 * @param {number} weight - Total weight in kg
 * @param {string} shippingZone - Zone: 'local', 'regional', 'national', 'international'
 * @param {number} subtotal - Order subtotal
 * @returns {number} Shipping cost
 */
export function calculateShipping(weight, shippingZone, subtotal = 0, shippingSpeed = 'standard') {
  // Free shipping threshold
  const freeShippingThreshold = 75;

  // Check if qualifies for free shipping
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }

  // Validate inputs
  if (typeof weight !== 'number' || weight <= 0) {
    return 0;
  }

  if (!shippingZone || typeof shippingZone !== 'string') {
    return 5.99; // Default shipping
  }

  const zone = shippingZone.toLowerCase();
  let baseRate = 0;

  // Zone-based rates
  if (zone === 'local') {
    baseRate = 5.99;
  } else if (zone === 'regional') {
    baseRate = 8.99;
  } else if (zone === 'national') {
    baseRate = 12.99;
  } else if (zone === 'international') {
    baseRate = 25.99;
  } else {
    baseRate = 8.99; // Default
  }

  // Weight-based surcharge
  let weightSurcharge = 0;
  if (weight > 5) {
    weightSurcharge = (weight - 5) * 2.50;
  }

  // Speed premium
  let speedMultiplier = 1;
  if (shippingSpeed === 'express') {
    speedMultiplier = 1.5;
  }

  const total = (baseRate + weightSurcharge) * speedMultiplier;
  return Math.round(total * 100) / 100;
}

/**
 * Calculates sales tax based on location and amount
 * @param {number} amount - Taxable amount
 * @param {string} state - US state code or country
 * @param {string} category - Product category for tax exemptions
 * @returns {number} Tax amount
 */
export function calculateTax(amount, state, category = '') {
  // Validation
  if (typeof amount !== 'number' || amount <= 0) {
    return 0;
  }

  if (!state || typeof state !== 'string') {
    return 0;
  }

  const stateUpper = state.toUpperCase();

  // Check for tax-exempt categories
  const exemptCategories = ['education', 'children'];
  if (category && exemptCategories.includes(category.toLowerCase())) {
    return 0;
  }

  // Tax rates by state - complex branching
  let taxRate = 0;

  if (stateUpper === 'CA') {
    taxRate = 0.0725; // California
  } else if (stateUpper === 'NY') {
    taxRate = 0.08; // New York
  } else if (stateUpper === 'TX') {
    taxRate = 0.0625; // Texas
  } else if (stateUpper === 'FL') {
    taxRate = 0.06; // Florida
  } else if (stateUpper === 'IL') {
    taxRate = 0.0625; // Illinois
  } else if (stateUpper === 'PA') {
    taxRate = 0.06; // Pennsylvania
  } else if (stateUpper === 'OH') {
    taxRate = 0.0575; // Ohio
  } else {
    taxRate = 0.07; // Default rate
  }

  const taxAmount = amount * taxRate;
  return Math.round(taxAmount * 100) / 100;
}

/**
 * Applies bulk purchase discount
 * @param {number} quantity - Item quantity
 * @param {number} unitPrice - Price per unit
 * @returns {object} Pricing info {totalPrice, discount, finalPrice}
 */
export function applyBulkDiscount(quantity, unitPrice) {
  // Validation with nested checks
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return 0;
  }

  if (typeof unitPrice !== 'number' || unitPrice <= 0) {
    return 0;
  }

  const totalPrice = quantity * unitPrice;
  let discountPercentage = 0;

  // Tiered bulk discounts with complex conditions
  if (quantity >= 100) {
    discountPercentage = 25; // 25% off for 100+
  } else if (quantity >= 50) {
    discountPercentage = 20; // 20% off for 50-99
  } else if (quantity >= 25) {
    discountPercentage = 15; // 15% off for 25-49
  } else if (quantity >= 10) {
    discountPercentage = 10; // 10% off for 10-24
  } else if (quantity >= 5) {
    discountPercentage = 5; // 5% off for 5-9
  }

  const discount = (totalPrice * discountPercentage) / 100;
  return Math.round(discount * 100) / 100;
}

/**
 * Applies bulk purchase discount with details
 * @param {number} quantity - Item quantity
 * @param {number} unitPrice - Price per unit
 * @returns {object} Pricing info
 */
export function applyBulkDiscountDetailed(quantity, unitPrice) {
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return { totalPrice: 0, discount: 0, finalPrice: 0 };
  }

  if (typeof unitPrice !== 'number' || unitPrice <= 0) {
    return { totalPrice: 0, discount: 0, finalPrice: 0 };
  }

  const totalPrice = quantity * unitPrice;
  let discountPercentage = 0;

  if (quantity >= 200) {
    discountPercentage = 30;
  } else if (quantity >= 100) {
    discountPercentage = 25;
  } else if (quantity >= 50) {
    discountPercentage = 20;
  } else if (quantity >= 20) {
    discountPercentage = 15;
  } else if (quantity >= 10) {
    discountPercentage = 10;
  } else if (quantity >= 5) {
    discountPercentage = 5;
  }

  const discount = (totalPrice * discountPercentage) / 100;
  const finalPrice = totalPrice - discount;

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    discountPercentage,
    finalPrice: Math.round(finalPrice * 100) / 100
  };
}

/**
 * Calculates loyalty points earned from purchase
 * @param {number} amount - Purchase amount
 * @param {string} customerTier - Customer tier: 'basic', 'silver', 'gold', 'platinum'
 * @param {boolean} isBirthday - Whether it's customer's birthday month
 * @returns {number} Points earned
 */
export function calculateLoyaltyPoints(amount, customerTier = 'basic', isBirthday = false) {
  // Validation
  if (typeof amount !== 'number' || amount <= 0) {
    return 0;
  }

  let pointsMultiplier = 1;

  // Tier-based multipliers with nested logic
  if (customerTier === 'platinum') {
    pointsMultiplier = 5;
  } else if (customerTier === 'gold') {
    pointsMultiplier = 3;
  } else if (customerTier === 'silver') {
    pointsMultiplier = 2;
  } else {
    pointsMultiplier = 1; // basic
  }

  // Birthday bonus
  if (isBirthday === true) {
    pointsMultiplier *= 2; // Double points on birthday month
  }

  // Base calculation: $1 = 1 point
  let points = Math.floor(amount * pointsMultiplier);

  // Bonus points for high value purchases
  if (amount >= 200) {
    points += 100; // Bonus 100 points
  } else if (amount >= 100) {
    points += 50; // Bonus 50 points
  } else if (amount >= 50) {
    points += 25; // Bonus 25 points
  }

  // Cap at 10000 points
  if (points > 10000) {
    points = 10000;
  }

  return points;
}

/**
 * Applies promotional pricing rules
 * @param {number} price - Original price
 * @param {string} promoCode - Promotional code
 * @param {object} productInfo - Product information {category, isNew, isClearance}
 * @returns {object} Pricing result {originalPrice, finalPrice, discount, promoApplied}
 */
export function applyPromotion(price, promoCode, productInfo = {}) {
  // Validation
  if (typeof price !== 'number' || price <= 0) {
    return {
      originalPrice: 0,
      finalPrice: 0,
      discount: 0,
      promoApplied: false
    };
  }

  let discount = 0;
  let promoApplied = false;

  // Complex promo code logic with nested conditions
  if (promoCode && typeof promoCode === 'string') {
    const code = promoCode.toUpperCase().trim();

    if (code === 'WELCOME10') {
      discount = price * 0.10;
      promoApplied = true;
    } else if (code === 'SAVE20') {
      if (price >= 50) { // Minimum purchase requirement
        discount = price * 0.20;
        promoApplied = true;
      }
    } else if (code === 'CLEARANCE30') {
      if (productInfo.isClearance === true) {
        discount = price * 0.30;
        promoApplied = true;
      }
    } else if (code === 'NEWRELEASE15') {
      if (productInfo.isNew === true) {
        discount = price * 0.15;
        promoApplied = true;
      }
    } else if (code === 'FICTION25') {
      if (productInfo.category === 'fiction') {
        discount = price * 0.25;
        promoApplied = true;
      }
    }
  }

  const finalPrice = price - discount;

  return promoApplied;
}

/**
 * Applies promotional pricing with details
 * @param {number} price - Original price
 * @param {string} promoCode - Promotional code
 * @param {object} productInfo - Product information
 * @returns {object} Pricing result
 */
export function applyPromotionDetailed(price, promoCode, productInfo = {}) {
  if (typeof price !== 'number' || price <= 0) {
    return {
      originalPrice: 0,
      finalPrice: 0,
      discount: 0,
      promoApplied: false
    };
  }

  let discount = 0;
  let promoApplied = false;

  if (promoCode && typeof promoCode === 'string') {
    const code = promoCode.toUpperCase().trim();

    if (code === 'WELCOME10') {
      discount = price * 0.10;
      promoApplied = true;
    } else if (code === 'SAVE20') {
      if (price >= 50) {
        discount = price * 0.20;
        promoApplied = true;
      }
    } else if (code === 'CLEARANCE30') {
      if (productInfo.isClearance === true) {
        discount = price * 0.30;
        promoApplied = true;
      }
    } else if (code === 'NEWRELEASE15') {
      if (productInfo.isNew === true) {
        discount = price * 0.15;
        promoApplied = true;
      }
    } else if (code === 'FICTION25') {
      if (productInfo.category === 'fiction') {
        discount = price * 0.25;
        promoApplied = true;
      }
    }
  }

  const finalPrice = price - discount;

  return {
    originalPrice: Math.round(price * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    promoApplied
  };
}

/**
 * Calculates final order total with all adjustments
 * @param {number} subtotal - Order subtotal
 * @param {object} adjustments - All adjustments {discount, shipping, tax}
 * @param {number} giftWrapCost - Optional gift wrap cost
 * @returns {number} Final total
 */
export function calculateFinalTotal(subtotal, adjustments = {}, giftWrapCost = 0) {
  // Validation
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return 0;
  }

  const discount = adjustments.discount || 0;
  const shipping = adjustments.shipping || 0;
  const tax = adjustments.tax || 0;

  // Validate adjustments are numbers
  if (typeof discount !== 'number' || discount < 0) {
    return 0;
  }

  if (typeof shipping !== 'number' || shipping < 0) {
    return 0;
  }

  if (typeof tax !== 'number' || tax < 0) {
    return 0;
  }

  if (typeof giftWrapCost !== 'number' || giftWrapCost < 0) {
    giftWrapCost = 0;
  }

  // Calculate total with nested operations
  let total = subtotal - discount;
  
  if (total < 0) {
    total = 0; // Cannot have negative total
  }

  total = total + shipping + tax + giftWrapCost;

  return Math.round(total * 100) / 100;
}
