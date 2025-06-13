/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

import { InternalError } from '@shadow-library/common';
import { Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { assertObjectID } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { ObjectId } = Types;

describe('assertObjectID', () => {
  it('should return the same ObjectId if input is already an ObjectId', () => {
    const oid = new ObjectId();
    expect(assertObjectID(oid)).toBe(oid);
  });

  it('should convert a valid ObjectId string to ObjectId', () => {
    const oid = new ObjectId();
    const result = assertObjectID(oid.toHexString());
    expect(result).toBeInstanceOf(ObjectId);
    expect(result.toHexString()).toBe(oid.toHexString());
  });

  it('should throw InternalError for invalid ObjectId string', () => {
    expect(() => assertObjectID('invalid-id')).toThrow(InternalError);
  });

  it('should throw the provided error if invalid and error is passed', () => {
    const customError = new Error('Custom error');
    expect(() => assertObjectID('invalid-id', customError)).toThrow(customError);
  });
});
