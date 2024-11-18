/**
 * Importing npm packages
 */
import { MixedSchemaTypeOptions, SchemaTypeOptions } from 'mongoose';

/**
 * Importing user defined packages
 */
import { DESIGN_TYPE_METADATA_KEY, PROP_METADATA_KEY, SCHEMA_FIELDS_METADATA_KEY } from '@lib/constants';

/**
 * Defining types
 */

export type PropOptions<T = undefined, EnforcedDocType = any> = SchemaTypeOptions<T extends undefined ? any : T, EnforcedDocType> | MixedSchemaTypeOptions<EnforcedDocType>;

/**
 * Declaring the constants
 */

export function Prop(options: PropOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey === 'symbol') throw new Error(`Cannot apply @Prop() to symbol ${propertyKey.toString()}`);
    if (!options.type) options.type = Reflect.getMetadata(DESIGN_TYPE_METADATA_KEY, target, propertyKey);
    const fields: string[] = Reflect.getMetadata(SCHEMA_FIELDS_METADATA_KEY, target) ?? [];
    Reflect.defineMetadata(SCHEMA_FIELDS_METADATA_KEY, fields.concat([propertyKey]), target);
    Reflect.defineMetadata(PROP_METADATA_KEY, options, target, propertyKey);
  };
}
