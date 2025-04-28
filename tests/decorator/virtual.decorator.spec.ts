/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { SCHEMA_METADATA_KEY } from '@lib/constants';
import { Prop, Schema, Virtual } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Virtual()', () => {
  @Schema({ toObject: { virtuals: true } })
  class Document {
    @Prop()
    username: string;

    @Virtual({ get: () => 'test' })
    uname: string;
  }

  it('should add the virtual metadata to the class', () => {
    const metadata = Reflect.getMetadata(SCHEMA_METADATA_KEY, Document);
    expect(metadata).toStrictEqual({
      virtuals: { uname: { get: expect.any(Function) } },
      toObject: { virtuals: true },
    });
  });
});
