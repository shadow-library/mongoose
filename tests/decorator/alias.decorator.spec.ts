/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { PROP_METADATA_KEY } from '@lib/constants';
import { Alias, Prop } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Alias()', () => {
  class Document {
    @Prop()
    username: string;

    @Alias('username')
    uname: string;
  }

  it('should add the alias metadata to the class', () => {
    const metadata = Reflect.getMetadata(PROP_METADATA_KEY, Document.prototype, 'username');
    expect(metadata).toStrictEqual({ type: String, alias: 'uname' });
  });
});
