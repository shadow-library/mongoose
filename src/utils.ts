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

/**
 * Declaring the constants
 */

export function assertObjectID(id: ID, error?: Error): ObjectId {
  if (id instanceof ObjectId) return id;
  if (ObjectId.isValid(id)) return new ObjectId(id);
  throw error ?? new InternalError(`Invalid ObjectId: ${id}`);
}
