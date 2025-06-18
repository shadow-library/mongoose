/**
 * Importing npm packages
 */
import { FactoryProvider, Module, OnModuleInit, forwardRef } from '@shadow-library/app';
import { Config, InternalError } from '@shadow-library/common';
import mongoose, { Connection, Document, Model } from 'mongoose';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MONGOOSE_MODULE_OPTIONS } from '@lib/constants';

import { ModelDefinition, MongooseFeatureOptions, MongooseModuleAsyncOptions, MongooseModuleFactoryOptions, MongooseModuleOptions } from './mongoose.interface';
import { createConnection, getConnectionToken, getModelToken, mongooseDebugLogger } from './mongoose.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class MongooseModule implements OnModuleInit {
  private static readonly modules = new Map<string, Class<MongooseModule>>();

  private static getMongooseModule(connectionName?: string): Class<MongooseModule> {
    const connectionToken = getConnectionToken(connectionName);
    const mongooseModule = this.modules.get(connectionToken);
    if (!mongooseModule) throw new InternalError(`MongooseModule is not initialized for connection: ${connectionName}`);
    return mongooseModule;
  }

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

    const MongooseConnectionModule = class extends MongooseModule {};
    Object.defineProperty(MongooseConnectionModule, 'name', { value: `Mongoose${connectionToken}Module` });
    Module({ providers: [connectionOptionsProvider, connectionProvider] })(MongooseConnectionModule);
    this.modules.set(connectionToken, MongooseConnectionModule);
    return MongooseConnectionModule;
  }

  static forFeature(models: ModelDefinition[], options?: MongooseFeatureOptions): Class<MongooseModule> {
    const connectionToken = getConnectionToken(options?.connectionName);
    const mongooseModule = forwardRef(() => this.getMongooseModule(options?.connectionName));
    const providers: FactoryProvider[] = [];

    for (const model of models) {
      const baseModelToken = getModelToken(model.name, options?.connectionName);
      const baseFactory = (connection: Connection) => connection.models[model.name] ?? connection.model(model.name, model.schema, model.name);
      providers.push({ token: baseModelToken, useFactory: baseFactory, inject: [connectionToken] });
      for (const discriminator of model.discriminators ?? []) {
        const discriminatorModelToken = getModelToken(discriminator.name, options?.connectionName);
        const discriminatorFactory = (model: Model<Document>) => model.discriminator(discriminator.name, discriminator.schema, discriminator.value);
        providers.push({ token: discriminatorModelToken, useFactory: discriminatorFactory, inject: [baseModelToken] });
      }
    }

    const featureToken = options?.featureName || `${models[0]?.name ?? 'Undefined'}Model`;
    const MongooseFeatureModule = class extends MongooseModule {};
    Object.defineProperty(MongooseFeatureModule, 'name', { value: `Mongoose${featureToken}Module` });
    Module({ imports: [mongooseModule], providers, exports: providers.map(provider => provider.token) })(MongooseFeatureModule);
    return MongooseFeatureModule;
  }

  onModuleInit(): void {
    mongoose.set('runValidators', true);
    mongoose.set('returnOriginal', false);
    mongoose.set('translateAliases', true);
    mongoose.set('toObject', { virtuals: true });
    mongoose.set('toJSON', { virtuals: true });
    if (Config.get('log.level') === 'debug') mongoose.set('debug', mongooseDebugLogger);
  }
}
