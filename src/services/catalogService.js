/**
 * Catalog Service
 * Handles product listing, searching, filtering, and sorting operations
 */

import { Product } from '../models/product.js';
import { validateSearchQuery, validateCategory, validatePrice } from '../utils/validators.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory product catalog
let productCatalog = [];

/**
 * Loads products from JSON file
 * @returns {Promise<boolean>} true if successful
 */
export async function loadProducts() {
  try {
    const dataPath = path.join(__dirname, '../../data/products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const productsData = JSON.parse(data);
    
    productCatalog = productsData.map(p => Product.fromJSON(p));
    return true;
  } catch (error) {
    console.error('Failed to load products:', error.message);
    return false;
  }
}

/**
 * Saves products to JSON file
 * @returns {Promise<boolean>} true if successful
 */
export async function saveProducts() {
  try {
    const dataPath = path.join(__dirname, '../../data/products.json');
    const data = JSON.stringify(productCatalog.map(p => p.toJSON()), null, 2);
    await fs.writeFile(dataPath, data, 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save products:', error.message);
    return false;
  }
}

/**
 * Gets all products with optional pagination
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} Paginated results
 */
export function getAllProducts(page = 1, limit = 20) {
  // Validation with nested conditions
  if (typeof page !== 'number' || page < 1) {
    page = 1;
  }

  if (typeof limit !== 'number' || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100; // Cap maximum limit
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = productCatalog.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    page,
    limit,
    total: productCatalog.length,
    totalPages: Math.ceil(productCatalog.length / limit),
    hasMore: endIndex < productCatalog.length
  };
}

/**
 * Gets product by ID
 * @param {string} productId - Product identifier
 * @returns {Product|null} Product or null if not found
 */
export function getProductById(productId) {
  if (!productId) {
    return null;
  }

  return productCatalog.find(p => p.id === productId) || null;
}

/**
 * Searches products by query with complex matching logic
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {Array<Product>} Matching products
 */
export function searchProducts(query, options = {}) {
  // Validate query
  const validation = validateSearchQuery(query);
  if (!validation.valid) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const { searchFields = ['title', 'author', 'description'], caseSensitive = false } = options;

  const results = [];

  // Iterate through catalog with nested matching logic
  for (let i = 0; i < productCatalog.length; i++) {
    const product = productCatalog[i];
    let matched = false;

    // Check each search field
    for (const field of searchFields) {
      if (matched) break; // Already matched, skip remaining fields

      let fieldValue = product[field];
      
      if (!fieldValue) continue;

      if (typeof fieldValue !== 'string') {
        fieldValue = String(fieldValue);
      }

      const compareValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
      const compareQuery = caseSensitive ? query : searchTerm;

      // Multiple matching strategies
      if (compareValue.includes(compareQuery)) {
        matched = true;
      } else if (compareValue.startsWith(compareQuery)) {
        matched = true;
      } else {
        // Word-by-word matching
        const words = compareQuery.split(/\s+/);
        let allWordsMatch = true;
        
        for (const word of words) {
          if (word.length >= 3 && !compareValue.includes(word)) {
            allWordsMatch = false;
            break;
          }
        }
        
        if (allWordsMatch && words.length > 0) {
          matched = true;
        }
      }
    }

    if (matched) {
      results.push(product);
    }
  }

  return results;
}

/**
 * Filters products by multiple criteria with complex logic
 * @param {object} filters - Filter criteria
 * @returns {Array<Product>} Filtered products
 */
export function filterProducts(filters = {}) {
  let results = [...productCatalog];

  // Category filter
  if (filters.category) {
    if (validateCategory(filters.category)) {
      const categoryLower = filters.category.toLowerCase();
      results = results.filter(p => p.category.toLowerCase() === categoryLower);
    }
  }

  // Price range filter with nested conditions
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    results = results.filter(product => {
      const price = product.price;
      
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        // Both min and max specified
        return price >= filters.minPrice && price <= filters.maxPrice;
      } else if (filters.minPrice !== undefined) {
        // Only min specified
        return price >= filters.minPrice;
      } else {
        // Only max specified
        return price <= filters.maxPrice;
      }
    });
  }

  // In stock filter
  if (filters.inStock === true) {
    results = results.filter(p => p.isInStock());
  }

  // Low stock filter
  if (filters.lowStock === true) {
    const threshold = filters.lowStockThreshold || 5;
    results = results.filter(p => p.isLowStock(threshold));
  }

  // Author filter with partial matching
  if (filters.author) {
    const authorLower = filters.author.toLowerCase();
    results = results.filter(p => 
      p.author.toLowerCase().includes(authorLower)
    );
  }

  // Discount eligible filter
  if (filters.discountEligible === true) {
    results = results.filter(p => p.isDiscountEligible());
  }

  return results;
}

/**
 * Sorts products by specified field and order
 * @param {Array<Product>} products - Products to sort
 * @param {string} sortBy - Field to sort by
 * @param {string} order - Sort order: 'asc' or 'desc'
 * @returns {Array<Product>} Sorted products
 */
export function sortProducts(products, sortBy = 'title', order = 'asc') {
  if (!Array.isArray(products) || products.length === 0) {
    return products;
  }

  // Create copy to avoid mutating original
  const sorted = [...products];

  // Validate sort order
  if (order !== 'asc' && order !== 'desc') {
    order = 'asc';
  }

  // Complex sorting logic with nested comparisons
  sorted.sort((a, b) => {
    let compareValueA, compareValueB;

    // Get comparison values based on sortBy field
    if (sortBy === 'price') {
      compareValueA = a.price;
      compareValueB = b.price;
    } else if (sortBy === 'stock') {
      compareValueA = a.stock;
      compareValueB = b.stock;
    } else if (sortBy === 'title') {
      compareValueA = a.title.toLowerCase();
      compareValueB = b.title.toLowerCase();
    } else if (sortBy === 'author') {
      compareValueA = a.author.toLowerCase();
      compareValueB = b.author.toLowerCase();
    } else if (sortBy === 'category') {
      compareValueA = a.category.toLowerCase();
      compareValueB = b.category.toLowerCase();
    } else {
      // Default to title
      compareValueA = a.title.toLowerCase();
      compareValueB = b.title.toLowerCase();
    }

    // Perform comparison based on type
    let comparison = 0;
    
    if (typeof compareValueA === 'number' && typeof compareValueB === 'number') {
      comparison = compareValueA - compareValueB;
    } else {
      // String comparison
      if (compareValueA < compareValueB) {
        comparison = -1;
      } else if (compareValueA > compareValueB) {
        comparison = 1;
      }
    }

    // Apply order direction
    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Gets products by category with sorting
 * @param {string} category - Category name
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order
 * @returns {Array<Product>} Products in category
 */
export function getProductsByCategory(category, sortBy = 'title', order = 'asc') {
  if (!validateCategory(category)) {
    return [];
  }

  const filtered = filterProducts({ category });
  return sortProducts(filtered, sortBy, order);
}

/**
 * Gets featured products based on business rules
 * @param {number} limit - Maximum number to return
 * @returns {Array<Product>} Featured products
 */
export function getFeaturedProducts(limit = 10) {
  // Complex selection logic
  const featured = [];

  // Criteria: high stock, discount eligible, popular categories
  const popularCategories = ['fiction', 'non-fiction', 'science'];

  for (const product of productCatalog) {
    // Multiple conditions for featuring
    if (product.stock >= 10 && product.isDiscountEligible()) {
      featured.push(product);
    } else if (popularCategories.includes(product.category.toLowerCase()) && product.stock > 0) {
      featured.push(product);
    }

    if (featured.length >= limit) {
      break;
    }
  }

  return featured;
}

/**
 * Gets recommended products based on a product
 * @param {string} productId - Reference product ID
 * @param {number} limit - Maximum recommendations
 * @returns {Array<Product>} Recommended products
 */
export function getRecommendations(productId, limit = 5) {
  const product = getProductById(productId);
  
  if (!product) {
    return [];
  }

  const recommendations = [];

  // Find products in same category
  const sameCategory = productCatalog.filter(p => 
    p.id !== productId && 
    p.category === product.category &&
    p.isInStock()
  );

  // Add products with similar price range (±20%)
  const priceMin = product.price * 0.8;
  const priceMax = product.price * 1.2;

  const similarPrice = productCatalog.filter(p =>
    p.id !== productId &&
    p.price >= priceMin &&
    p.price <= priceMax &&
    p.isInStock()
  );

  // Combine and deduplicate
  const combined = [...sameCategory, ...similarPrice];
  const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());

  // Take up to limit
  return unique.slice(0, limit);
}

/**
 * Adds a new product to catalog
 * @param {object} productData - Product data
 * @returns {Product|null} Created product or null if invalid
 */
export function addProduct(productData) {
  // Validation
  if (!productData || typeof productData !== 'object') {
    return null;
  }

  // Validate required fields
  const required = ['id', 'title', 'author', 'price', 'category', 'isbn', 'stock'];
  for (const field of required) {
    if (productData[field] === undefined || productData[field] === null) {
      return null;
    }
  }

  // Validate price
  const priceValidation = validatePrice(productData.price);
  if (!priceValidation.valid) {
    return null;
  }

  // Check if ID already exists
  if (getProductById(productData.id)) {
    return null;
  }

  const product = new Product(
    productData.id,
    productData.title,
    productData.author,
    productData.price,
    productData.category,
    productData.isbn,
    productData.stock,
    productData.description
  );

  productCatalog.push(product);
  return product;
}

/**
 * Updates an existing product
 * @param {string} productId - Product to update
 * @param {object} updates - Fields to update
 * @returns {boolean} true if successful
 */
export function updateProduct(productId, updates) {
  const product = getProductById(productId);
  
  if (!product) {
    return false;
  }

  // Apply allowed updates with validation
  if (updates.price !== undefined) {
    const validation = validatePrice(updates.price);
    if (validation.valid) {
      product.price = updates.price;
    }
  }

  if (updates.stock !== undefined && typeof updates.stock === 'number') {
    if (updates.stock >= 0) {
      product.stock = updates.stock;
    }
  }

  if (updates.title && typeof updates.title === 'string') {
    product.title = updates.title;
  }

  if (updates.description && typeof updates.description === 'string') {
    product.description = updates.description;
  }

  return true;
}

/**
 * Deletes a product from catalog
 * @param {string} productId - Product to delete
 * @returns {boolean} true if deleted
 */
export function deleteProduct(productId) {
  const index = productCatalog.findIndex(p => p.id === productId);
  
  if (index === -1) {
    return false;
  }

  productCatalog.splice(index, 1);
  return true;
}
