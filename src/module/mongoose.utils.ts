/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { DEFAULT_DB_CONNECTION } from '@lib/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function getModelToken(model: string, connectionName?: string) {
  if (connectionName === undefined) return `${model}Model`;
  return `${getConnectionToken(connectionName)}/${model}Model`;
}

export function getConnectionToken(name?: string) {
  return name && name !== DEFAULT_DB_CONNECTION ? `${name}Connection` : DEFAULT_DB_CONNECTION;
}
