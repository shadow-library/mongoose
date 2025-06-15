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
  const result = Object.create(target);
  Object.defineProperty(result, 'getParent', { value: () => parent, enumerable: false, writable: false, configurable: false });
  return result as LinkedWithParent<T, U>;
}

export function attachMatchingParent<S extends object, P extends object>(sources: S[], sourceKey: keyof S, parents: P[], parentKey?: keyof P): LinkedWithParent<S, P | null>[];
export function attachMatchingParent<S extends object, P extends object>(sources: S[], sourceKey: keyof S, parents: P[], throwErrorIfNotFound: true): LinkedWithParent<S, P>[];
export function attachMatchingParent<S extends object, P extends object>(
  sources: S[],
  sourceKey: keyof S,
  parents: P[],
  parentKey: keyof P,
  throwErrorIfNotFound: true,
): LinkedWithParent<S, P>[];
export function attachMatchingParent<S extends object, P extends object>(
  sources: S[],
  sourceKey: keyof S,
  parents: P[],
  parentKeyOrThrowErrorIfNotFound?: keyof P | boolean,
  throwErrorIfNotFound = false,
): LinkedWithParent<S, P | null>[] {
  let parentKey = typeof parentKeyOrThrowErrorIfNotFound === 'undefined' ? sourceKey : parentKeyOrThrowErrorIfNotFound;
  if (typeof parentKeyOrThrowErrorIfNotFound === 'boolean') {
    throwErrorIfNotFound = parentKeyOrThrowErrorIfNotFound;
    parentKey = sourceKey;
  }

  const parentMap = new Map<string, P>();
  for (const parent of parents) {
    const key = String(parent[parentKey as keyof P]);
    parentMap.set(key, parent);
  }

  const result: LinkedWithParent<S, P | null>[] = [];
  for (const source of sources) {
    const key = String(source[sourceKey]);
    const parent = parentMap.get(key) ?? null;
    if (parent === null && throwErrorIfNotFound) throw new InternalError(`Parent not found for source with key ${key}`);
    const linkedSource = attachParent(source, parent);
    result.push(linkedSource);
  }

  return result;
}
