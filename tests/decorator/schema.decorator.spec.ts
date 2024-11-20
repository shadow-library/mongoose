/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { SCHEMA_METADATA_KEY } from '@lib/constants';
import { Schema } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Schema()', () => {
  @Schema({ versionKey: false })
  class Document {
    field: string;
  }

  it('should add the mongoose schema options metadata to the class', () => {
    const options = Reflect.getMetadata(SCHEMA_METADATA_KEY, Document);
    expect(options).toStrictEqual({ versionKey: false });
  });
});
