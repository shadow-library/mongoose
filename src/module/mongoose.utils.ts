/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { DEFAULT_CONNECTION_NAME } from '@lib/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function getModelToken(model: string, connectionName?: string) {
  const connectionToken = getConnectionToken(connectionName);
  const modelToken = `${model}Model`;
  return `${connectionToken}/${modelToken}`;
}

export function getConnectionToken(name?: string) {
  if (!name) name = DEFAULT_CONNECTION_NAME;
  return `${name}Connection`;
}
