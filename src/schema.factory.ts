/**
 * Importing npm packages
 */
import { Schema, SchemaDefinition, SchemaType } from 'mongoose';
import { type Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { PROP_METADATA_KEY, SCHEMA_FIELDS_METADATA_KEY, SCHEMA_METADATA_KEY } from './constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const BUILT_IN_TYPES: (Class<unknown> | BigIntConstructor)[] = [Boolean, Number, String, Map, Date, Buffer, BigInt];

/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export class SchemaFactory {
  private static isPrimitiveType(type: Class<unknown>): boolean {
    return BUILT_IN_TYPES.includes(type);
  }

  private static isMongooseSchemaType(type: Class<unknown>): boolean {
    return Object.getPrototypeOf(type.prototype)?.constructor === SchemaType;
  }

  private static getType(type: Class<unknown>): Class<unknown> | SchemaDefinition | Schema {
    if (this.isPrimitiveType(type) || this.isMongooseSchemaType(type)) return type;
    const definition = this.createDefinition(type);
    const schemaOptions = Reflect.getMetadata(SCHEMA_METADATA_KEY, type);
    if (schemaOptions) return new Schema(definition, schemaOptions);
    return definition;
  }

  private static createDefinition(target: Class<unknown>): SchemaDefinition {
    const definition: SchemaDefinition = {};
    const fields: string[] = Reflect.getMetadata(SCHEMA_FIELDS_METADATA_KEY, target.prototype) ?? [];
    for (const field of fields) {
      const options = Reflect.getMetadata(PROP_METADATA_KEY, target.prototype, field);
      options.type = this.getType(options.type);
      definition[field] = options;
    }
    return definition;
  }

  static create(target: Class<unknown>): Schema {
    const definition = this.createDefinition(target);
    const schemaOptions = Reflect.getMetadata(SCHEMA_METADATA_KEY, target);
    return new Schema(definition, schemaOptions);
  }
}
