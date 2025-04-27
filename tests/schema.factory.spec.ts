/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

import { Schema as MongooseSchema } from 'mongoose';

/**
 * Importing user defined packages
 */
import { Alias, Prop, Schema, SchemaFactory } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('SchemaFactory', () => {
  @Schema({ versionKey: false })
  class SubDocumentOne {
    @Prop()
    id: MongooseSchema.Types.ObjectId;
  }

  class SubDocumentTwo {
    @Prop()
    field: string;
  }

  @Schema()
  class Document {
    @Prop()
    records: MongooseSchema.Types.Map;

    @Prop()
    subDocumentOne: SubDocumentOne;

    @Prop()
    subDocumentTwo: SubDocumentTwo;

    @Alias('subDocumentOne')
    aliasedSubDocumentOne: SubDocumentOne;
  }

  it('should not be able to instantiate the class', () => {
    expect(() => new SchemaFactory()).toThrowError();
  });

  it('should create a schema for the given class', () => {
    const schema = SchemaFactory.create(SubDocumentTwo);
    expect(schema).toBeInstanceOf(MongooseSchema);
    expect(schema.obj).toStrictEqual({ field: { type: String } });
  });

  it('should create a schema for the given class with options', () => {
    const schema = SchemaFactory.create(SubDocumentOne);
    expect(schema).toBeInstanceOf(MongooseSchema);
    expect(schema.get('versionKey')).toBe(false);
    expect(schema.obj).toStrictEqual({ id: { type: MongooseSchema.Types.ObjectId } });
  });

  it('should create a schema for the given class with sub documents', () => {
    const schema = SchemaFactory.create(Document);
    expect(schema).toBeInstanceOf(MongooseSchema);
    expect(schema.obj).toStrictEqual({
      records: {
        type: MongooseSchema.Types.Map,
      },
      subDocumentOne: {
        type: expect.any(MongooseSchema),
        alias: 'aliasedSubDocumentOne',
      },
      subDocumentTwo: {
        type: {
          field: {
            type: String,
          },
        },
      },
    });
  });
});
