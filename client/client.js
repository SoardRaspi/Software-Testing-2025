/**
 * Client-side JavaScript for Mini Online Bookstore
 * Handles API communication and session management
 */

const API_BASE = '/api';
let sessionId = null;

// ===== Session Management =====

/**
 * Initialize session - create or retrieve existing session
 */
function initSession() {
  sessionId = localStorage.getItem('sessionId');
  
  if (!sessionId) {
    // Create new session with guest user
    const guestEmail = `guest_${Date.now()}@bookstore.com`;
    const guestName = 'Guest User';
    
    createSession(guestEmail, guestName);
  }
}

/**
 * Create a new user session
 */
async function createSession(email, name) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name })
    });

    const data = await response.json();

    if (data.success) {
      sessionId = data.sessionId;
      localStorage.setItem('sessionId', sessionId);
      return data;
    } else {
      console.error('Failed to create session:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

/**
 * End current session
 */
async function endSession() {
  if (!sessionId) return;

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Session-ID': sessionId
      }
    });

    localStorage.removeItem('sessionId');
    sessionId = null;
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

// ===== Cart Operations =====

/**
 * Get current user's cart
 */
async function getCart() {
  if (!sessionId) {
    console.error('No active session');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/cart`, {
      headers: {
        'Session-ID': sessionId
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.cart;
    } else {
      console.error('Failed to get cart:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    return null;
  }
}

/**
 * Add item to cart
 */
async function addItemToCart(productId, quantity = 1) {
  if (!sessionId) {
    console.error('No active session');
    return { success: false, message: 'No active session' };
  }

  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId
      },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Error adding to cart' };
  }
}

/**
 * Remove item from cart
 */
async function removeFromCart(productId) {
  if (!sessionId) {
    console.error('No active session');
    return { success: false, message: 'No active session' };
  }

  try {
    const response = await fetch(`${API_BASE}/cart/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId
      },
      body: JSON.stringify({ productId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Error removing from cart' };
  }
}

/**
 * Update cart item quantity
 */
async function updateCartQuantity(productId, quantity) {
  if (!sessionId) {
    console.error('No active session');
    return { success: false, message: 'No active session' };
  }

  try {
    const response = await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId
      },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, message: 'Error updating cart' };
  }
}

/**
 * Get cart item count
 */
async function updateCartCount() {
  const cart = await getCart();
  
  if (cart) {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    
    if (cartCountElement) {
      cartCountElement.textContent = totalItems;
    }
  }
}

// ===== Order Operations =====

/**
 * Checkout - create order from cart
 */
async function checkout(orderDetails) {
  if (!sessionId) {
    console.error('No active session');
    return { success: false, message: 'No active session' };
  }

  try {
    const response = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId
      },
      body: JSON.stringify(orderDetails)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during checkout:', error);
    return { success: false, message: 'Error during checkout' };
  }
}

/**
 * Get user's orders
 */
async function getUserOrders(filters = {}) {
  if (!sessionId) {
    console.error('No active session');
    return null;
  }

  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/orders?${params}`, {
      headers: {
        'Session-ID': sessionId
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.orders;
    } else {
      console.error('Failed to get orders:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting orders:', error);
    return null;
  }
}

/**
 * Get order details by ID
 */
async function getOrderDetails(orderId) {
  if (!sessionId) {
    console.error('No active session');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: {
        'Session-ID': sessionId
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.order;
    } else {
      console.error('Failed to get order details:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting order details:', error);
    return null;
  }
}

/**
 * Cancel an order
 */
async function cancelOrder(orderId) {
  if (!sessionId) {
    console.error('No active session');
    return { success: false, message: 'No active session' };
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Session-ID': sessionId
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error canceling order:', error);
    return { success: false, message: 'Error canceling order' };
  }
}

// ===== Catalog Operations =====

/**
 * Search products
 */
async function searchProducts(query, filters = {}) {
  try {
    const params = new URLSearchParams({
      search: query,
      ...filters
    });

    const response = await fetch(`${API_BASE}/catalog?${params}`);
    const data = await response.json();

    if (data.success) {
      return data.products;
    } else {
      console.error('Failed to search products:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Get product by ID
 */
async function getProduct(productId) {
  try {
    const response = await fetch(`${API_BASE}/catalog/${productId}`);
    const data = await response.json();

    if (data.success) {
      return data.product;
    } else {
      console.error('Failed to get product:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * Get featured products
 */
async function getFeaturedProducts(limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/featured?limit=${limit}`);
    const data = await response.json();

    if (data.success) {
      return data.products;
    } else {
      console.error('Failed to get featured products:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error getting featured products:', error);
    return [];
  }
}

// Export functions for use in HTML pages
if (typeof window !== 'undefined') {
  window.initSession = initSession;
  window.createSession = createSession;
  window.endSession = endSession;
  window.getCart = getCart;
  window.addItemToCart = addItemToCart;
  window.removeFromCart = removeFromCart;
  window.updateCartQuantity = updateCartQuantity;
  window.updateCartCount = updateCartCount;
  window.checkout = checkout;
  window.getUserOrders = getUserOrders;
  window.getOrderDetails = getOrderDetails;
  window.cancelOrder = cancelOrder;
  window.searchProducts = searchProducts;
  window.getProduct = getProduct;
  window.getFeaturedProducts = getFeaturedProducts;
}
