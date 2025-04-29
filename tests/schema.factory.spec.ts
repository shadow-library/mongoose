/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

import { withThis } from '@shadow-library/common';
import { Schema as MongooseSchema, VirtualType } from 'mongoose';

/**
 * Importing user defined packages
 */
import { Alias, Prop, Schema, SchemaFactory, Virtual } from '@shadow-library/mongoose';

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

  @Schema({ toObject: { virtuals: true } })
  class User {
    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Virtual({
      get: withThis((obj: User) => `${obj.firstName} ${obj.lastName}`),
      set: withThis((obj: User, value: string) => ([obj.firstName = '', obj.lastName = ''] = value.split(' '))),
    })
    fullName: string;
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

  it('should create a schema for the given class with virtuals', () => {
    const setObj = {} as any;
    const getObj = { firstName: 'John', lastName: 'Doe' } as any;
    const schema = SchemaFactory.create(User);

    const virtual = schema.virtual('fullName');
    const getResult = virtual.applyGetters({}, getObj);
    virtual.applySetters('John Doe', setObj);

    expect(virtual).toBeInstanceOf(VirtualType);
    expect(getResult).toBe('John Doe');
    expect(setObj).toStrictEqual({ firstName: 'John', lastName: 'Doe' });
  });
});
