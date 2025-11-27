/**
 * Unit Tests for Validators Module
 * 
 * These tests target mutation operators:
 * - ROR (Relational Operator Replacement): Testing boundary conditions
 * - LOR (Logical Operator Replacement): Testing boolean logic
 * - AOR (Arithmetic Operator Replacement): Testing calculations in validation
 */

import assert from 'assert';
import * as validators from '../../src/utils/validators.js';

describe('Validators Module - Unit Tests', () => {
  
  // describe('validateEmail', () => {
    
  //   it('should accept valid email addresses', () => {
  //     // This kills RV (Return Value) mutants that flip true/false
  //     assert.strictEqual(validators.validateEmail('user@example.com'), true);
  //     assert.strictEqual(validators.validateEmail('test.user@domain.co.uk'), true);
  //     assert.strictEqual(validators.validateEmail('name+tag@company.org'), true);
  //   });
    
  //   it('should reject empty or null emails', () => {
  //     // Kills LOR mutants that remove null checks
  //     assert.strictEqual(validators.validateEmail(''), false);
  //     assert.strictEqual(validators.validateEmail(null), false);
  //     assert.strictEqual(validators.validateEmail(undefined), false);
  //   });
    
  //   it('should reject emails without @ symbol', () => {
  //     // Kills conditional branch mutants
  //     assert.strictEqual(validators.validateEmail('invalidemail.com'), false);
  //     assert.strictEqual(validators.validateEmail('user.example.com'), false);
  //   });
    
  //   it('should reject emails with multiple @ symbols', () => {
  //     // Kills ROR mutants that change comparison operators
  //     assert.strictEqual(validators.validateEmail('user@@example.com'), false);
  //     assert.strictEqual(validators.validateEmail('user@domain@example.com'), false);
  //   });
    
  //   it('should reject emails without domain', () => {
  //     // Kills LOR mutants in complex boolean expressions
  //     assert.strictEqual(validators.validateEmail('user@'), false);
  //     assert.strictEqual(validators.validateEmail('@example.com'), false);
  //   });
    
  //   it('should reject emails with invalid domain format', () => {
  //     // Kills ROR mutants that affect indexOf comparisons
  //     assert.strictEqual(validators.validateEmail('user@domain'), false);
  //     assert.strictEqual(validators.validateEmail('user@.com'), false);
  //   });
    
  //   it('should reject emails that are too short', () => {
  //     // Kills ROR mutants: >= to > or < in length checks
  //     assert.strictEqual(validators.validateEmail('a@b.c'), false);
  //     assert.strictEqual(validators.validateEmail('@b.co'), false);
  //   });
    
  //   it('should handle edge case email lengths', () => {
  //     // Tests boundary conditions - kills ROR mutants
  //     const minValidEmail = 'a@bc.de'; // 7 chars - might be edge case
  //     const result = validators.validateEmail(minValidEmail);
  //     assert.strictEqual(typeof result, 'boolean');
  //   });
  // });
  
  describe('validateISBN', () => {
    
    it('should accept valid ISBN-10', () => {
      // Kills RV mutants that flip return values
      assert.strictEqual(validators.validateISBN('0-306-40615-2'), true);
      assert.strictEqual(validators.validateISBN('0306406152'), true);
    });
    
    it('should accept valid ISBN-13', () => {
      // Kills RV mutants
      assert.strictEqual(validators.validateISBN('978-3-16-148410-0'), true);
      assert.strictEqual(validators.validateISBN('9783161484100'), true);
    });
    
    it('should reject ISBN with invalid checksum', () => {
      // Kills AOR mutants in checksum calculation (*, +, %)
      assert.strictEqual(validators.validateISBN('0306406153'), false); // Wrong checksum
      assert.strictEqual(validators.validateISBN('9783161484101'), false); // Wrong checksum
    });
    
    it('should reject ISBN with invalid length', () => {
      // Kills ROR mutants: !== to ===, length comparisons
      assert.strictEqual(validators.validateISBN('12345'), false);
      assert.strictEqual(validators.validateISBN('12345678901234'), false);
    });
    
    it('should reject ISBN with non-digit characters', () => {
      // Kills LOR mutants in validation logic
      assert.strictEqual(validators.validateISBN('03064O6152'), false); // O instead of 0
      assert.strictEqual(validators.validateISBN('978316148410A'), false); // A instead of number
    });
    
    it('should reject null or empty ISBN', () => {
      // Kills LOR mutants that remove null checks
      assert.strictEqual(validators.validateISBN(''), false);
      assert.strictEqual(validators.validateISBN(null), false);
      assert.strictEqual(validators.validateISBN(undefined), false);
    });
    
    it('should handle ISBN with hyphens correctly', () => {
      // Tests that hyphens are stripped - kills string mutation issues
      assert.strictEqual(
        validators.validateISBN('978-0-306-40615-7'),
        validators.validateISBN('9780306406157')
      );
    });
  });
  
  describe('validatePrice', () => {
    
    it('should accept valid positive prices', () => {
      // Kills RV mutants
      assert.strictEqual(validators.validatePrice(10.99).valid, true);
      assert.strictEqual(validators.validatePrice(0.01).valid, true);
      assert.strictEqual(validators.validatePrice(999.99).valid, true);
    });
    
    it('should reject negative prices', () => {
      // Kills ROR mutants: > to >= or < in boundary checks
      assert.strictEqual(validators.validatePrice(-1).valid, false);
      assert.strictEqual(validators.validatePrice(-0.01).valid, false);
    });
    
    it('should reject zero price by default', () => {
      // Kills ROR mutants: > to >= (strict inequality)
      assert.strictEqual(validators.validatePrice(0).valid, false);
    });
    
    it('should accept zero price when allowZero option is true', () => {
      // Kills LOR mutants in option handling
      assert.strictEqual(validators.validatePrice(0, { allowZero: true }).valid, true);
    });
    
    it('should enforce minimum price when specified', () => {
      // Kills ROR mutants: >= to > in min comparison
      const options = { min: 5.00 };
      assert.strictEqual(validators.validatePrice(4.99, options).valid, false);
      assert.strictEqual(validators.validatePrice(5.00, options).valid, true);
      assert.strictEqual(validators.validatePrice(5.01, options).valid, true);
    });
    
    it('should enforce maximum price when specified', () => {
      // Kills ROR mutants: <= to < in max comparison
      const options = { max: 100.00 };
      assert.strictEqual(validators.validatePrice(100.01, options).valid, false);
      assert.strictEqual(validators.validatePrice(100.00, options).valid, true);
      assert.strictEqual(validators.validatePrice(99.99, options).valid, true);
    });
    
    it('should enforce both min and max price', () => {
      // Kills LOR mutants: && to || in combined conditions
      const options = { min: 10, max: 50 };
      assert.strictEqual(validators.validatePrice(9.99, options).valid, false);
      assert.strictEqual(validators.validatePrice(10.00, options).valid, true);
      assert.strictEqual(validators.validatePrice(50.00, options).valid, true);
      assert.strictEqual(validators.validatePrice(50.01, options).valid, false);
    });
    
    it('should reject non-numeric prices', () => {
      // Kills type check mutants
      assert.strictEqual(validators.validatePrice('10.99').valid, false);
      assert.strictEqual(validators.validatePrice(NaN).valid, false);
      assert.strictEqual(validators.validatePrice(Infinity).valid, false);
    });
    
    it('should reject null or undefined prices', () => {
      // Kills LOR mutants in null checks
      assert.strictEqual(validators.validatePrice(null).valid, false);
      assert.strictEqual(validators.validatePrice(undefined).valid, false);
    });
  });
  
  describe('validateQuantity', () => {
    
    it('should accept valid positive integers', () => {
      // Kills RV mutants
      assert.strictEqual(validators.validateQuantity(1).valid, true);
      assert.strictEqual(validators.validateQuantity(10).valid, true);
      assert.strictEqual(validators.validateQuantity(100).valid, true);
    });
    
    it('should reject zero quantity', () => {
      // Kills ROR mutants: > to >= in boundary check
      assert.strictEqual(validators.validateQuantity(0).valid, false);
    });
    
    it('should reject negative quantities', () => {
      // Kills ROR mutants
      assert.strictEqual(validators.validateQuantity(-1).valid, false);
      assert.strictEqual(validators.validateQuantity(-10).valid, false);
    });
    
    it('should reject non-integer quantities', () => {
      // Kills type validation mutants
      assert.strictEqual(validators.validateQuantity(1.5).valid, false);
      assert.strictEqual(validators.validateQuantity(10.99).valid, false);
    });
    
    it('should enforce maximum quantity when specified', () => {
      // Kills ROR mutants: <= to < in max comparison
      assert.strictEqual(validators.validateQuantity(101, { max: 100 }).valid, false);
      assert.strictEqual(validators.validateQuantity(100, { max: 100 }).valid, true);
      assert.strictEqual(validators.validateQuantity(99, { max: 100 }).valid, true);
    });
    
    it('should reject null or undefined quantities', () => {
      // Kills LOR mutants in null checks
      assert.strictEqual(validators.validateQuantity(null).valid, false);
      assert.strictEqual(validators.validateQuantity(undefined).valid, false);
    });
    
    it('should reject non-numeric quantities', () => {
      // Kills type check mutants
      assert.strictEqual(validators.validateQuantity('5').valid, false);
      assert.strictEqual(validators.validateQuantity(NaN).valid, false);
    });
  });
  
  // describe('validateAddress', () => {
    
  //   const validAddress = {
  //     fullName: 'John Doe',
  //     street: '123 Main St',
  //     city: 'Springfield',
  //     state: 'IL',
  //     zipCode: '62701',
  //     country: 'USA',
  //     phone: '555-1234'
  //   };
    
  //   it('should accept complete valid address', () => {
  //     // Kills RV mutants and validates all fields
  //     const result = validators.validateAddress(validAddress);
  //     assert.strictEqual(result.valid, true);
  //     assert.strictEqual(result.errors.length, 0);
  //   });
    
  //   it('should reject address missing required fields', () => {
  //     // Kills LOR mutants in field existence checks
  //     const incomplete = { fullName: 'John Doe' };
  //     const result = validators.validateAddress(incomplete);
  //     assert.strictEqual(result.valid, false);
  //     assert.ok(result.errors.length > 0);
  //   });
    
  //   it('should detect empty string fields', () => {
  //     // Kills string length check mutants
  //     const emptyFields = { ...validAddress, street: '' };
  //     const result = validators.validateAddress(emptyFields);
  //     assert.strictEqual(result.valid, false);
  //     assert.ok(result.errors.includes('street'));
  //   });
    
  //   it('should validate phone number format', () => {
  //     // Kills regex or pattern matching mutants
  //     const invalidPhone = { ...validAddress, phone: '123' };
  //     const result = validators.validateAddress(invalidPhone);
  //     // Phone validation might have specific rules
  //     assert.strictEqual(typeof result.valid, 'boolean');
  //   });
    
  //   it('should validate zip code format', () => {
  //     // Kills string pattern mutants
  //     const invalidZip = { ...validAddress, zipCode: '1' };
  //     const result = validators.validateAddress(invalidZip);
  //     assert.strictEqual(typeof result.valid, 'boolean');
  //   });
    
  //   it('should reject null or undefined address', () => {
  //     // Kills LOR mutants in null checks
  //     assert.strictEqual(validators.validateAddress(null).valid, false);
  //     assert.strictEqual(validators.validateAddress(undefined).valid, false);
  //   });
  // });
  
  // describe('validateSearchQuery', () => {
    
  //   it('should accept valid search queries', () => {
  //     // Kills RV mutants
  //     assert.strictEqual(validators.validateSearchQuery('javascript').valid, true);
  //     assert.strictEqual(validators.validateSearchQuery('Node.js programming').valid, true);
  //   });
    
  //   it('should reject queries that are too short', () => {
  //     // Kills ROR mutants: < to <= in length check
  //     assert.strictEqual(validators.validateSearchQuery('ab').valid, false);
  //     assert.strictEqual(validators.validateSearchQuery('a').valid, false);
  //   });
    
  //   it('should reject queries that are too long', () => {
  //     // Kills ROR mutants: > to >= in length check
  //     const longQuery = 'a'.repeat(101);
  //     assert.strictEqual(validators.validateSearchQuery(longQuery).valid, false);
  //   });
    
  //   it('should reject queries with only special characters', () => {
  //     // Kills string validation mutants
  //     assert.strictEqual(validators.validateSearchQuery('!!!').valid, false);
  //     assert.strictEqual(validators.validateSearchQuery('***').valid, false);
  //   });
    
  //   it('should accept queries with numbers', () => {
  //     // Validates alphanumeric handling
  //     assert.strictEqual(validators.validateSearchQuery('ISBN 12345').valid, true);
  //     assert.strictEqual(validators.validateSearchQuery('2024 books').valid, true);
  //   });
    
  //   it('should handle edge case lengths', () => {
  //     // Tests exact boundary conditions - kills ROR mutants
  //     assert.strictEqual(validators.validateSearchQuery('abc').valid, true); // Min length
  //     const maxLengthQuery = 'a'.repeat(100);
  //     assert.strictEqual(validators.validateSearchQuery(maxLengthQuery).valid, true);
  //   });
    
  //   it('should reject null or undefined queries', () => {
  //     // Kills LOR mutants in null checks
  //     assert.strictEqual(validators.validateSearchQuery(null).valid, false);
  //     assert.strictEqual(validators.validateSearchQuery(undefined).valid, false);
  //     assert.strictEqual(validators.validateSearchQuery('').valid, false);
  //   });
  // });
  
  // describe('validateDiscountCode', () => {
    
  //   it('should accept valid discount codes', () => {
  //     // Kills RV mutants
  //     assert.strictEqual(validators.validateDiscountCode('SAVE10').valid, true);
  //     assert.strictEqual(validators.validateDiscountCode('SUMMER2024').valid, true);
  //   });
    
  //   it('should reject codes that are too short', () => {
  //     // Kills ROR mutants in length validation
  //     assert.strictEqual(validators.validateDiscountCode('AB').valid, false);
  //     assert.strictEqual(validators.validateDiscountCode('A').valid, false);
  //   });
    
  //   it('should reject codes with invalid characters', () => {
  //     // Kills string validation mutants
  //     assert.strictEqual(validators.validateDiscountCode('SAVE@10').valid, false);
  //     assert.strictEqual(validators.validateDiscountCode('DISC!COUNT').valid, false);
  //   });
    
  //   it('should handle case sensitivity appropriately', () => {
  //     // Tests string comparison mutants
  //     const result1 = validators.validateDiscountCode('save10');
  //     const result2 = validators.validateDiscountCode('SAVE10');
  //     assert.strictEqual(typeof result1.valid, 'boolean');
  //     assert.strictEqual(typeof result2.valid, 'boolean');
  //   });
    
  //   it('should reject null or empty codes', () => {
  //     // Kills LOR mutants in null checks
  //     assert.strictEqual(validators.validateDiscountCode(null).valid, false);
  //     assert.strictEqual(validators.validateDiscountCode(undefined).valid, false);
  //     assert.strictEqual(validators.validateDiscountCode('').valid, false);
  //   });
  // });

  describe('validateCategory', () => {
    it('should accept valid categories', () => {
      assert.strictEqual(validators.validateCategory('fiction'), true);
      assert.strictEqual(validators.validateCategory('science'), true);
      assert.strictEqual(validators.validateCategory('history'), true);
      assert.strictEqual(validators.validateCategory('technology'), true);
    });

    it('should accept case insensitive categories', () => {
      assert.strictEqual(validators.validateCategory('FICTION'), true);
      assert.strictEqual(validators.validateCategory('Science'), true);
      assert.strictEqual(validators.validateCategory('HISTORY'), true);
    });

    it('should accept categories with whitespace', () => {
      assert.strictEqual(validators.validateCategory('  fiction  '), true);
      assert.strictEqual(validators.validateCategory('science '), true);
      assert.strictEqual(validators.validateCategory(' history'), true);
    });

    it('should reject invalid categories', () => {
      assert.strictEqual(validators.validateCategory('invalid'), false);
      assert.strictEqual(validators.validateCategory('unknown'), false);
    });

    it('should reject empty or null categories', () => {
      assert.strictEqual(validators.validateCategory(''), false);
      assert.strictEqual(validators.validateCategory(null), false);
      assert.strictEqual(validators.validateCategory(undefined), false);
    });

    it('should reject non-string categories', () => {
      assert.strictEqual(validators.validateCategory(123), false);
      assert.strictEqual(validators.validateCategory({}), false);
    });
  });

  describe('validateAddress', () => {
    const validAddress = {
      street: '123 Main Street',
      city: 'New York',
      zip: '10001',
      country: 'USA'
    };

    it('should accept valid address', () => {
      const result = validators.validateAddress(validAddress);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject null address', () => {
      const result = validators.validateAddress(null);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.includes('Address is required'));
    });

    it('should reject undefined address', () => {
      const result = validators.validateAddress(undefined);
      assert.strictEqual(result.valid, false);
    });

    it('should reject non-object address', () => {
      const result = validators.validateAddress('not an object');
      assert.strictEqual(result.valid, false);
    });

    describe('street validation', () => {
      it('should reject missing street', () => {
        const addr = { ...validAddress, street: undefined };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('street'));
      });

      it('should reject empty street', () => {
        const addr = { ...validAddress, street: '' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('street'));
      });

      it('should reject street with only whitespace', () => {
        const addr = { ...validAddress, street: '   ' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('street'));
      });

      it('should reject too short street (4 chars)', () => {
        const addr = { ...validAddress, street: 'Main' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('street'));
      });

      it('should accept street at minimum length (5 chars)', () => {
        const addr = { ...validAddress, street: '12345' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should accept street at maximum length (200 chars)', () => {
        const addr = { ...validAddress, street: 'a'.repeat(200) };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should reject too long street (201 chars)', () => {
        const addr = { ...validAddress, street: 'a'.repeat(201) };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('street'));
      });
    });

    describe('city validation', () => {
      it('should reject missing city', () => {
        const addr = { ...validAddress, city: undefined };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('city'));
      });

      it('should reject empty city', () => {
        const addr = { ...validAddress, city: '' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('city'));
      });

      it('should reject city with only whitespace', () => {
        const addr = { ...validAddress, city: '  ' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('city'));
      });

      it('should reject too short city (1 char)', () => {
        const addr = { ...validAddress, city: 'A' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('city'));
      });

      it('should accept city at minimum length (2 chars)', () => {
        const addr = { ...validAddress, city: 'NY' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should accept city at maximum length (100 chars)', () => {
        const addr = { ...validAddress, city: 'a'.repeat(100) };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should reject too long city (101 chars)', () => {
        const addr = { ...validAddress, city: 'a'.repeat(101) };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('city'));
      });
    });

    describe('zip validation', () => {
      it('should reject missing zip', () => {
        const addr = { ...validAddress, zip: undefined };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });

      it('should reject empty zip', () => {
        const addr = { ...validAddress, zip: '' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });

      it('should reject too short zip (4 chars)', () => {
        const addr = { ...validAddress, zip: '1234' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });

      it('should accept valid 5 digit zip', () => {
        const addr = { ...validAddress, zip: '12345' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should accept zip at maximum length (10 chars)', () => {
        const addr = { ...validAddress, zip: '1234567890' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should reject too long zip (11 chars)', () => {
        const addr = { ...validAddress, zip: '12345678901' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });

      it('should accept zip with hyphen', () => {
        const addr = { ...validAddress, zip: '12345-6789' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should accept zip with spaces', () => {
        const addr = { ...validAddress, zip: '12345 6789' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });

      it('should reject zip with invalid characters', () => {
        const addr = { ...validAddress, zip: 'ABC12' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });

      it('should reject zip with letters', () => {
        const addr = { ...validAddress, zip: '12A45' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('zip'));
      });
    });

    describe('country validation', () => {
      it('should reject missing country', () => {
        const addr = { ...validAddress, country: undefined };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('country'));
      });

      it('should reject empty country', () => {
        const addr = { ...validAddress, country: '' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('country'));
      });

      it('should reject too short country (1 char)', () => {
        const addr = { ...validAddress, country: 'A' };
        const result = validators.validateAddress(addr);
        assert.ok(result.errors.includes('country'));
      });

      it('should accept country at minimum length (2 chars)', () => {
        const addr = { ...validAddress, country: 'US' };
        const result = validators.validateAddress(addr);
        assert.strictEqual(result.valid, true);
      });
    });

    it('should collect multiple errors', () => {
      const addr = { street: 'ab', city: 'a', zip: '123', country: 'x' };
      const result = validators.validateAddress(addr);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length >= 2);
    });
  });

  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const result = validators.validateSearchQuery('book');
      assert.strictEqual(result.valid, true);
    });

    it('should reject non-string queries', () => {
      const result = validators.validateSearchQuery(123);
      assert.strictEqual(result.valid, false);
    });

    it('should reject empty string even with minLength 0', () => {
      const result = validators.validateSearchQuery('', { minLength: 0 });
      assert.strictEqual(result.valid, false);
    });

    it('should reject queries below minimum length', () => {
      const result = validators.validateSearchQuery('ab', { minLength: 3 });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('at least'));
    });

    it('should accept queries at minimum length boundary', () => {
      const result = validators.validateSearchQuery('abc', { minLength: 3 });
      assert.strictEqual(result.valid, true);
    });

    it('should reject queries exceeding maximum length', () => {
      const result = validators.validateSearchQuery('a'.repeat(101), { maxLength: 100 });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('exceed'));
    });

    it('should accept queries at maximum length boundary', () => {
      const result = validators.validateSearchQuery('a'.repeat(100), { maxLength: 100 });
      assert.strictEqual(result.valid, true);
    });

    it('should reject special characters by default', () => {
      const result = validators.validateSearchQuery('test@#$');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('invalid characters'));
    });

    it('should allow special characters when enabled', () => {
      const result = validators.validateSearchQuery('test@#$', { allowSpecialChars: true });
      assert.strictEqual(result.valid, true);
    });

    it('should allow basic punctuation', () => {
      const result = validators.validateSearchQuery("test, query's - ok");
      assert.strictEqual(result.valid, true);
    });

    it('should trim whitespace before validation', () => {
      const result = validators.validateSearchQuery('  test  ', { minLength: 3 });
      assert.strictEqual(result.valid, true);
    });

    it('should allow periods and commas', () => {
      const result = validators.validateSearchQuery('test. query, ok');
      assert.strictEqual(result.valid, true);
    });

    it('should allow quotes', () => {
      const result = validators.validateSearchQuery('test "quote"');
      assert.strictEqual(result.valid, true);
    });
  });

  describe('validateDiscountCode', () => {
    it('should accept valid discount codes', () => {
      const result = validators.validateDiscountCode('SAVE20');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.code, 'SAVE20');
    });

    it('should convert to uppercase', () => {
      const result = validators.validateDiscountCode('save20');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.code, 'SAVE20');
    });

    it('should trim whitespace', () => {
      const result = validators.validateDiscountCode('  SAVE20  ');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.code, 'SAVE20');
    });

    it('should accept codes with hyphens', () => {
      const result = validators.validateDiscountCode('SAVE-20');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.code, 'SAVE-20');
    });

    it('should accept codes with numbers', () => {
      const result = validators.validateDiscountCode('CODE123');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.code, 'CODE123');
    });

    it('should reject empty codes', () => {
      const result = validators.validateDiscountCode('');
      assert.strictEqual(result.valid, false);
    });

    it('should reject null codes', () => {
      const result = validators.validateDiscountCode(null);
      assert.strictEqual(result.valid, false);
    });

    it('should reject undefined codes', () => {
      const result = validators.validateDiscountCode(undefined);
      assert.strictEqual(result.valid, false);
    });

    it('should reject non-string codes', () => {
      const result = validators.validateDiscountCode(123);
      assert.strictEqual(result.valid, false);
    });

    it('should reject codes too short (3 chars)', () => {
      const result = validators.validateDiscountCode('ABC');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('too short'));
    });

    it('should accept codes at minimum length (4 chars)', () => {
      const result = validators.validateDiscountCode('ABCD');
      assert.strictEqual(result.valid, true);
    });

    it('should accept codes at maximum length (20 chars)', () => {
      const result = validators.validateDiscountCode('A'.repeat(20));
      assert.strictEqual(result.valid, true);
    });

    it('should reject codes too long (21 chars)', () => {
      const result = validators.validateDiscountCode('A'.repeat(21));
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('too long'));
    });

    it('should reject codes with special characters', () => {
      const result = validators.validateDiscountCode('SAVE@20');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('invalid characters'));
    });

    it('should reject codes with spaces', () => {
      const result = validators.validateDiscountCode('TEST CODE');
      assert.strictEqual(result.valid, false);
    });

    it('should reject codes with lowercase letters', () => {
      const result = validators.validateDiscountCode('save_20');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validatePaymentMethod', () => {
    it('should accept credit_card', () => {
      assert.strictEqual(validators.validatePaymentMethod('credit_card'), true);
    });

    it('should accept debit_card', () => {
      assert.strictEqual(validators.validatePaymentMethod('debit_card'), true);
    });

    it('should accept paypal', () => {
      assert.strictEqual(validators.validatePaymentMethod('paypal'), true);
    });

    it('should accept cash_on_delivery', () => {
      assert.strictEqual(validators.validatePaymentMethod('cash_on_delivery'), true);
    });

    it('should accept bank_transfer', () => {
      assert.strictEqual(validators.validatePaymentMethod('bank_transfer'), true);
    });

    it('should accept uppercase', () => {
      assert.strictEqual(validators.validatePaymentMethod('CREDIT_CARD'), true);
      assert.strictEqual(validators.validatePaymentMethod('PAYPAL'), true);
    });

    it('should accept mixed case', () => {
      assert.strictEqual(validators.validatePaymentMethod('PayPal'), true);
      assert.strictEqual(validators.validatePaymentMethod('Credit_Card'), true);
    });

    it('should reject invalid methods', () => {
      assert.strictEqual(validators.validatePaymentMethod('bitcoin'), false);
      assert.strictEqual(validators.validatePaymentMethod('check'), false);
    });

    it('should reject empty method', () => {
      assert.strictEqual(validators.validatePaymentMethod(''), false);
    });

    it('should reject null method', () => {
      assert.strictEqual(validators.validatePaymentMethod(null), false);
    });

    it('should reject undefined method', () => {
      assert.strictEqual(validators.validatePaymentMethod(undefined), false);
    });

    it('should reject non-string methods', () => {
      assert.strictEqual(validators.validatePaymentMethod(123), false);
      assert.strictEqual(validators.validatePaymentMethod({}), false);
    });
  });
});
