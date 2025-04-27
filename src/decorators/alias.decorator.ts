/**
 * Importing npm packages
 */
import { Reflector } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { PROP_METADATA_KEY } from '@lib/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Alias(aliasFor: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflector.updateMetadata(PROP_METADATA_KEY, { alias: propertyKey }, target, aliasFor);
  };
}
