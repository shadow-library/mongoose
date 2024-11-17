/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { PROP_METADATA_KEY, SCHEMA_FIELDS_METADATA_KEY } from '@lib/constants';
import { Prop } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Prop()', () => {
  class SubDocument {
    @Prop({ required: true })
    num: number;
  }

  class Document {
    @Prop({ type: SubDocument, required: true })
    str: SubDocument;
  }

  it('should add the mongoose field options metadata to the class', () => {
    const options = Reflect.getMetadata(PROP_METADATA_KEY, Document.prototype, 'str');
    expect(options).toStrictEqual({ type: SubDocument, required: true });
  });

  it('should add the fields metadata to the class', () => {
    const fields: string[] = Reflect.getMetadata(SCHEMA_FIELDS_METADATA_KEY, Document.prototype);
    expect(fields).toStrictEqual(['str']);
  });
});
