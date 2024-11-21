/**
 * Importing npm packages
 */
import { SchemaOptions } from 'mongoose';

/**
 * Importing user defined packages
 */
import { SCHEMA_METADATA_KEY } from '@lib/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Schema(options: SchemaOptions = {}): ClassDecorator {
  return target => {
    if (Object.keys(options).length === 0) return;
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, options, target);
  };
}
