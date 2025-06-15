/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

import { InternalError } from '@shadow-library/common';
import { Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { assertObjectID, attachMatchingParent, attachParent } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const { ObjectId } = Types;

describe('Utils', () => {
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

  describe('attachParent', () => {
    it('should attach a getParent method returning the parent', () => {
      const child = { foo: 'bar' };
      const parent = { baz: 42 };
      const linked = attachParent(child, parent);

      expect(linked.getParent).toBeInstanceOf(Function);
      expect(linked.getParent()).toBe(parent);
    });

    it('should not enumerate getParent in for...in loops', () => {
      const child = { foo: 'bar' };
      const parent = { baz: 42 };
      const linked = attachParent(child, parent);

      const keys = [];
      for (const key in linked) keys.push(key);
      expect(keys).not.toContain('getParent');
    });

    it('should not allow overwriting getParent', () => {
      const child = { foo: 'bar' };
      const parent = { baz: 42 };
      const linked = attachParent(child, parent);

      expect(() => (linked.getParent = () => ({ baz: 10 }))).toThrow();
      expect(linked.getParent()).toBe(parent);
    });
  });

  describe('attachMatchingParent', () => {
    const parents = [
      { id: 1, name: 'Parent1' },
      { id: 2, name: 'Parent2' },
    ];

    const sources = [
      { id: 1, sourceId: 3, value: 'Child1' },
      { id: 2, sourceId: 1, value: 'Child2' },
      { id: 3, sourceId: 2, value: 'Child3' },
    ];

    it('should attach parent using same key in source and parent', () => {
      const result = attachMatchingParent(sources, 'id', parents);
      expect(result?.[0]?.getParent()).toBe(parents[0]);
      expect(result?.[1]?.getParent()).toBe(parents[1]);
      expect(result?.[2]?.getParent()).toBeNull();
    });

    it('should attach parent using different key for source and parent', () => {
      const result = attachMatchingParent(sources, 'sourceId', parents, 'id');
      expect(result?.[0]?.getParent()).toBeNull();
      expect(result?.[1]?.getParent()).toBe(parents[0]);
      expect(result?.[2]?.getParent()).toEqual(parents[1]);
    });

    it('should throw if parent not found and throwErrorIfNotFound is true', () => {
      expect(() => attachMatchingParent(sources, 'id', parents, 'id', true)).toThrow(InternalError);
    });

    it('should throw if parent not found and throwErrorIfNotFound is true (parentKey omitted)', () => {
      expect(() => attachMatchingParent(sources, 'id', parents, true)).toThrow(InternalError);
    });
  });
});
