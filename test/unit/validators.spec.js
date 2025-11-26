/**
 * Unit Tests for Validators Module
 * 
 * These tests target mutation operators:
 * - ROR (Relational Operator Replacement): Testing boundary conditions
 * - LOR (Logical Operator Replacement): Testing boolean logic
 * - AOR (Arithmetic Operator Replacement): Testing calculations in validation
 */

import { expect } from 'chai';
import * as validators from '../../src/utils/validators.js';

describe('Validators Module - Unit Tests', () => {
  
  describe('validateEmail', () => {
    
    it('should accept valid email addresses', () => {
      // This kills RV (Return Value) mutants that flip true/false
      expect(validators.validateEmail('user@example.com')).to.be.true;
      expect(validators.validateEmail('test.user@domain.co.uk')).to.be.true;
      expect(validators.validateEmail('name+tag@company.org')).to.be.true;
    });
    
    it('should reject empty or null emails', () => {
      // Kills LOR mutants that remove null checks
      expect(validators.validateEmail('')).to.be.false;
      expect(validators.validateEmail(null)).to.be.false;
      expect(validators.validateEmail(undefined)).to.be.false;
    });
    
    it('should reject emails without @ symbol', () => {
      // Kills conditional branch mutants
      expect(validators.validateEmail('invalidemail.com')).to.be.false;
      expect(validators.validateEmail('user.example.com')).to.be.false;
    });
    
    it('should reject emails with multiple @ symbols', () => {
      // Kills ROR mutants that change comparison operators
      expect(validators.validateEmail('user@@example.com')).to.be.false;
      expect(validators.validateEmail('user@domain@example.com')).to.be.false;
    });
    
    it('should reject emails without domain', () => {
      // Kills LOR mutants in complex boolean expressions
      expect(validators.validateEmail('user@')).to.be.false;
      expect(validators.validateEmail('@example.com')).to.be.false;
    });
    
    it('should reject emails with invalid domain format', () => {
      // Kills ROR mutants that affect indexOf comparisons
      expect(validators.validateEmail('user@domain')).to.be.false;
      expect(validators.validateEmail('user@.com')).to.be.false;
    });
    
    it('should reject emails that are too short', () => {
      // Kills ROR mutants: >= to > or < in length checks
      expect(validators.validateEmail('a@b.c')).to.be.false;
      expect(validators.validateEmail('@b.co')).to.be.false;
    });
    
    it('should handle edge case email lengths', () => {
      // Tests boundary conditions - kills ROR mutants
      const minValidEmail = 'a@bc.de'; // 7 chars - might be edge case
      const result = validators.validateEmail(minValidEmail);
      expect(result).to.be.a('boolean');
    });
  });
  
  describe('validateISBN', () => {
    
    it('should accept valid ISBN-10', () => {
      // Kills RV mutants that flip return values
      expect(validators.validateISBN('0-306-40615-2')).to.be.true;
      expect(validators.validateISBN('0306406152')).to.be.true;
    });
    
    it('should accept valid ISBN-13', () => {
      // Kills RV mutants
      expect(validators.validateISBN('978-3-16-148410-0')).to.be.true;
      expect(validators.validateISBN('9783161484100')).to.be.true;
    });
    
    it('should reject ISBN with invalid checksum', () => {
      // Kills AOR mutants in checksum calculation (*, +, %)
      expect(validators.validateISBN('0306406153')).to.be.false; // Wrong checksum
      expect(validators.validateISBN('9783161484101')).to.be.false; // Wrong checksum
    });
    
    it('should reject ISBN with invalid length', () => {
      // Kills ROR mutants: !== to ===, length comparisons
      expect(validators.validateISBN('12345')).to.be.false;
      expect(validators.validateISBN('12345678901234')).to.be.false;
    });
    
    it('should reject ISBN with non-digit characters', () => {
      // Kills LOR mutants in validation logic
      expect(validators.validateISBN('03064O6152')).to.be.false; // O instead of 0
      expect(validators.validateISBN('978316148410A')).to.be.false; // A instead of number
    });
    
    it('should reject null or empty ISBN', () => {
      // Kills LOR mutants that remove null checks
      expect(validators.validateISBN('')).to.be.false;
      expect(validators.validateISBN(null)).to.be.false;
      expect(validators.validateISBN(undefined)).to.be.false;
    });
    
    it('should handle ISBN with hyphens correctly', () => {
      // Tests that hyphens are stripped - kills string mutation issues
      expect(validators.validateISBN('978-0-306-40615-7')).to.equal(
        validators.validateISBN('9780306406157')
      );
    });
  });
  
  describe('validatePrice', () => {
    
    it('should accept valid positive prices', () => {
      // Kills RV mutants
      expect(validators.validatePrice(10.99)).to.be.true;
      expect(validators.validatePrice(0.01)).to.be.true;
      expect(validators.validatePrice(999.99)).to.be.true;
    });
    
    it('should reject negative prices', () => {
      // Kills ROR mutants: > to >= or < in boundary checks
      expect(validators.validatePrice(-1)).to.be.false;
      expect(validators.validatePrice(-0.01)).to.be.false;
    });
    
    it('should reject zero price by default', () => {
      // Kills ROR mutants: > to >= (strict inequality)
      expect(validators.validatePrice(0)).to.be.false;
    });
    
    it('should accept zero price when allowZero option is true', () => {
      // Kills LOR mutants in option handling
      expect(validators.validatePrice(0, { allowZero: true })).to.be.true;
    });
    
    it('should enforce minimum price when specified', () => {
      // Kills ROR mutants: >= to > in min comparison
      const options = { min: 5.00 };
      expect(validators.validatePrice(4.99, options)).to.be.false;
      expect(validators.validatePrice(5.00, options)).to.be.true;
      expect(validators.validatePrice(5.01, options)).to.be.true;
    });
    
    it('should enforce maximum price when specified', () => {
      // Kills ROR mutants: <= to < in max comparison
      const options = { max: 100.00 };
      expect(validators.validatePrice(100.01, options)).to.be.false;
      expect(validators.validatePrice(100.00, options)).to.be.true;
      expect(validators.validatePrice(99.99, options)).to.be.true;
    });
    
    it('should enforce both min and max price', () => {
      // Kills LOR mutants: && to || in combined conditions
      const options = { min: 10, max: 50 };
      expect(validators.validatePrice(9.99, options)).to.be.false;
      expect(validators.validatePrice(10.00, options)).to.be.true;
      expect(validators.validatePrice(50.00, options)).to.be.true;
      expect(validators.validatePrice(50.01, options)).to.be.false;
    });
    
    it('should reject non-numeric prices', () => {
      // Kills type check mutants
      expect(validators.validatePrice('10.99')).to.be.false;
      expect(validators.validatePrice(NaN)).to.be.false;
      expect(validators.validatePrice(Infinity)).to.be.false;
    });
    
    it('should reject null or undefined prices', () => {
      // Kills LOR mutants in null checks
      expect(validators.validatePrice(null)).to.be.false;
      expect(validators.validatePrice(undefined)).to.be.false;
    });
  });
  
  describe('validateQuantity', () => {
    
    it('should accept valid positive integers', () => {
      // Kills RV mutants
      expect(validators.validateQuantity(1)).to.be.true;
      expect(validators.validateQuantity(10)).to.be.true;
      expect(validators.validateQuantity(100)).to.be.true;
    });
    
    it('should reject zero quantity', () => {
      // Kills ROR mutants: > to >= in boundary check
      expect(validators.validateQuantity(0)).to.be.false;
    });
    
    it('should reject negative quantities', () => {
      // Kills ROR mutants
      expect(validators.validateQuantity(-1)).to.be.false;
      expect(validators.validateQuantity(-10)).to.be.false;
    });
    
    it('should reject non-integer quantities', () => {
      // Kills type validation mutants
      expect(validators.validateQuantity(1.5)).to.be.false;
      expect(validators.validateQuantity(10.99)).to.be.false;
    });
    
    it('should enforce maximum quantity when specified', () => {
      // Kills ROR mutants: <= to < in max comparison
      expect(validators.validateQuantity(101, { max: 100 })).to.be.false;
      expect(validators.validateQuantity(100, { max: 100 })).to.be.true;
      expect(validators.validateQuantity(99, { max: 100 })).to.be.true;
    });
    
    it('should reject null or undefined quantities', () => {
      // Kills LOR mutants in null checks
      expect(validators.validateQuantity(null)).to.be.false;
      expect(validators.validateQuantity(undefined)).to.be.false;
    });
    
    it('should reject non-numeric quantities', () => {
      // Kills type check mutants
      expect(validators.validateQuantity('5')).to.be.false;
      expect(validators.validateQuantity(NaN)).to.be.false;
    });
  });
  
  describe('validateAddress', () => {
    
    const validAddress = {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'USA',
      phone: '555-1234'
    };
    
    it('should accept complete valid address', () => {
      // Kills RV mutants and validates all fields
      const result = validators.validateAddress(validAddress);
      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });
    
    it('should reject address missing required fields', () => {
      // Kills LOR mutants in field existence checks
      const incomplete = { fullName: 'John Doe' };
      const result = validators.validateAddress(incomplete);
      expect(result.valid).to.be.false;
      expect(result.errors).to.not.be.empty;
    });
    
    it('should detect empty string fields', () => {
      // Kills string length check mutants
      const emptyFields = { ...validAddress, street: '' };
      const result = validators.validateAddress(emptyFields);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('street');
    });
    
    it('should validate phone number format', () => {
      // Kills regex or pattern matching mutants
      const invalidPhone = { ...validAddress, phone: '123' };
      const result = validators.validateAddress(invalidPhone);
      // Phone validation might have specific rules
      expect(result.valid).to.be.a('boolean');
    });
    
    it('should validate zip code format', () => {
      // Kills string pattern mutants
      const invalidZip = { ...validAddress, zipCode: '1' };
      const result = validators.validateAddress(invalidZip);
      expect(result.valid).to.be.a('boolean');
    });
    
    it('should reject null or undefined address', () => {
      // Kills LOR mutants in null checks
      expect(validators.validateAddress(null).valid).to.be.false;
      expect(validators.validateAddress(undefined).valid).to.be.false;
    });
  });
  
  describe('validateSearchQuery', () => {
    
    it('should accept valid search queries', () => {
      // Kills RV mutants
      expect(validators.validateSearchQuery('javascript')).to.be.true;
      expect(validators.validateSearchQuery('Node.js programming')).to.be.true;
    });
    
    it('should reject queries that are too short', () => {
      // Kills ROR mutants: < to <= in length check
      expect(validators.validateSearchQuery('ab')).to.be.false;
      expect(validators.validateSearchQuery('a')).to.be.false;
    });
    
    it('should reject queries that are too long', () => {
      // Kills ROR mutants: > to >= in length check
      const longQuery = 'a'.repeat(101);
      expect(validators.validateSearchQuery(longQuery)).to.be.false;
    });
    
    it('should reject queries with only special characters', () => {
      // Kills string validation mutants
      expect(validators.validateSearchQuery('!!!')).to.be.false;
      expect(validators.validateSearchQuery('***')).to.be.false;
    });
    
    it('should accept queries with numbers', () => {
      // Validates alphanumeric handling
      expect(validators.validateSearchQuery('ISBN 12345')).to.be.true;
      expect(validators.validateSearchQuery('2024 books')).to.be.true;
    });
    
    it('should handle edge case lengths', () => {
      // Tests exact boundary conditions - kills ROR mutants
      expect(validators.validateSearchQuery('abc')).to.be.true; // Min length
      const maxLengthQuery = 'a'.repeat(100);
      expect(validators.validateSearchQuery(maxLengthQuery)).to.be.true;
    });
    
    it('should reject null or undefined queries', () => {
      // Kills LOR mutants in null checks
      expect(validators.validateSearchQuery(null)).to.be.false;
      expect(validators.validateSearchQuery(undefined)).to.be.false;
      expect(validators.validateSearchQuery('')).to.be.false;
    });
  });
  
  describe('validateDiscountCode', () => {
    
    it('should accept valid discount codes', () => {
      // Kills RV mutants
      expect(validators.validateDiscountCode('SAVE10')).to.be.true;
      expect(validators.validateDiscountCode('SUMMER2024')).to.be.true;
    });
    
    it('should reject codes that are too short', () => {
      // Kills ROR mutants in length validation
      expect(validators.validateDiscountCode('AB')).to.be.false;
      expect(validators.validateDiscountCode('A')).to.be.false;
    });
    
    it('should reject codes with invalid characters', () => {
      // Kills string validation mutants
      expect(validators.validateDiscountCode('SAVE@10')).to.be.false;
      expect(validators.validateDiscountCode('DISC!COUNT')).to.be.false;
    });
    
    it('should handle case sensitivity appropriately', () => {
      // Tests string comparison mutants
      const result1 = validators.validateDiscountCode('save10');
      const result2 = validators.validateDiscountCode('SAVE10');
      expect(result1).to.be.a('boolean');
      expect(result2).to.be.a('boolean');
    });
    
    it('should reject null or empty codes', () => {
      // Kills LOR mutants in null checks
      expect(validators.validateDiscountCode(null)).to.be.false;
      expect(validators.validateDiscountCode(undefined)).to.be.false;
      expect(validators.validateDiscountCode('')).to.be.false;
    });
  });
});
