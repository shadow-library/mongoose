/**
 * Importing npm packages
 */
import { FactoryProvider, Module } from '@shadow-library/app';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MONGOOSE_MODULE_OPTIONS } from '@lib/constants';

import { MongooseModuleAsyncOptions, MongooseModuleFactoryOptions, MongooseModuleOptions } from './mongoose.interface';
import { createConnection, getConnectionToken } from './mongoose.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class MongooseModule {
  private static readonly modules = new Map<string, Class<MongooseModule>>();

  static forRoot(uri: string, options: MongooseModuleOptions = {}): Class<MongooseModule> {
    return this.forRootAsync({ connectionName: options.connectionName, useFactory: () => ({ uri, ...options }) });
  }

  static forRootAsync(options: MongooseModuleAsyncOptions): Class<MongooseModule> {
    const connectionToken = getConnectionToken(options.connectionName);
    const cachedClass = this.modules.get(connectionToken);
    if (cachedClass) return cachedClass;

    const connectionOptionsProvider: FactoryProvider = { token: MONGOOSE_MODULE_OPTIONS, useFactory: options.useFactory };
    if (options.inject) connectionOptionsProvider.inject = options.inject;
    const connectionProvider: FactoryProvider = {
      token: connectionToken,
      useFactory: (opts: MongooseModuleFactoryOptions) => createConnection(connectionToken, opts),
      inject: [MONGOOSE_MODULE_OPTIONS],
    };

    const Class = class extends MongooseModule {};
    Module({ providers: [connectionOptionsProvider, connectionProvider] })(Class);
    this.modules.set(connectionToken, Class);
    return Class;
  }
}
