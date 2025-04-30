/**
 * Importing npm packages
 */
import { FactoryProvider, Module } from '@shadow-library/app';
import { InternalError } from '@shadow-library/common';
import { Connection, Document, Model } from 'mongoose';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MONGOOSE_MODULE_OPTIONS } from '@lib/constants';

import { ModelDefinition, MongooseModuleAsyncOptions, MongooseModuleFactoryOptions, MongooseModuleOptions } from './mongoose.interface';
import { createConnection, getConnectionToken, getModelToken } from './mongoose.utils';

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

  static forFeature(models: ModelDefinition[], connectionName?: string): Class<MongooseModule> {
    const connectionToken = getConnectionToken(connectionName);
    const mongooseModule = this.modules.get(connectionToken);
    if (!mongooseModule) throw new InternalError(`MongooseModule is not initialized for connection: ${connectionName}`);
    const providers: FactoryProvider[] = [];

    for (const model of models) {
      const baseModelToken = getModelToken(model.name, connectionName);
      const baseFactory = (connection: Connection) => connection.models[model.name] ?? connection.model(model.name, model.schema, model.name);
      providers.push({ token: baseModelToken, useFactory: baseFactory, inject: [connectionToken] });
      for (const discriminator of model.discriminators ?? []) {
        const discriminatorModelToken = getModelToken(discriminator.name, connectionName);
        const discriminatorFactory = (model: Model<Document>) => model.discriminator(discriminator.name, discriminator.schema, discriminator.value);
        providers.push({ token: discriminatorModelToken, useFactory: discriminatorFactory, inject: [baseModelToken] });
      }
    }

    const Class = class extends MongooseModule {};
    Module({ imports: [mongooseModule], providers, exports: providers.map(provider => provider.token) })(Class);
    return Class;
  }
}
