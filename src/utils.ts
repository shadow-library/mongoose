/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';
import { ObjectId } from 'mongodb';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type ID = string | ObjectId;

export type LinkedWithParent<T, U> = T & { getParent: () => U };

/**
 * Declaring the constants
 */

export function assertObjectID(id: ID, error?: Error): ObjectId {
  if (id instanceof ObjectId) return id;
  if (ObjectId.isValid(id)) return new ObjectId(id);
  throw error ?? new InternalError(`Invalid ObjectId: ${id}`);
}

export function attachParent<T extends object, U>(target: T, parent: U): LinkedWithParent<T, U> {
  Object.defineProperty(target, 'getParent', { value: () => parent, enumerable: false, writable: false, configurable: false });
  return target as LinkedWithParent<T, U>;
}
