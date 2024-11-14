/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { add } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Sample test', () => {
  it('should pass', () => {
    expect(add(1, 2)).toBe(3);
  });
});
