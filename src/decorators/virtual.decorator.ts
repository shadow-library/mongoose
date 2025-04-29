/**
 * Importing npm packages
 */
import { Reflector } from '@shadow-library/common';
import { VirtualTypeOptions } from 'mongoose';

/**
 * Importing user defined packages
 */
import { SCHEMA_METADATA_KEY } from '@lib/constants';

/**
 * Defining types
 */

export interface VirtualOptions {
  /**
   * The options to pass to the virtual type.
   */
  options?: VirtualTypeOptions;
  /**
   * The getter function to use for the virtual.
   */
  get?: (...args: any[]) => any;
  /**
   * The setter function to use for the virtual.
   */
  set?: (...args: any[]) => any;
}

/**
 * Declaring the constants
 */

export function Virtual(options: VirtualOptions): PropertyDecorator {
  return (target, propertyKey) => {
    Reflector.updateMetadata(SCHEMA_METADATA_KEY, { virtuals: { [propertyKey]: options } }, target.constructor);
  };
}
