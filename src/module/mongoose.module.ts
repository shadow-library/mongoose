/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MongooseModuleAsyncOptions, MongooseModuleOptions } from './mongoose.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class MongooseModule {
  static forRoot(uri: string, options: MongooseModuleOptions = {}): Class<MongooseModule> {
    return MongooseModule;
  }

  static forRootAsync(options: MongooseModuleAsyncOptions): Class<MongooseModule> {
    return MongooseModule;
  }
}
