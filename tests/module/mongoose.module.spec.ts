/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { MONGOOSE_MODULE_OPTIONS } from '@lib/constants';
import { MongooseModule } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('MongooseModule', () => {
  const Module = MongooseModule.forRoot('mongodb://localhost:27017/test', { connectionName: 'TestConnection', appName: 'TestApp' });
  const key = Reflect.getMetadataKeys(Module).find(key => key.toString() === 'Symbol(module-metadata)');
  const moduleMetadata = Reflect.getMetadata(key, Module);

  it('should create providers for the connection', () => {
    expect(moduleMetadata).toStrictEqual({
      providers: [
        { token: MONGOOSE_MODULE_OPTIONS, useFactory: expect.any(Function) },
        { token: 'TestConnectionConnection', useFactory: expect.any(Function), inject: [MONGOOSE_MODULE_OPTIONS] },
      ],
    });
  });

  it('should create providers for async connection', () => {
    const asyncModule = MongooseModule.forRootAsync({
      inject: [],
      connectionName: 'AsyncConnection',
      useFactory: () => ({ uri: 'mongodb://localhost:27017/test', appName: 'AsyncApp' }),
    });
    const asyncKey = Reflect.getMetadataKeys(asyncModule).find(key => key.toString() === 'Symbol(module-metadata)');
    const asyncModuleMetadata = Reflect.getMetadata(asyncKey, asyncModule);
    expect(asyncModuleMetadata).toStrictEqual({
      providers: [
        { token: MONGOOSE_MODULE_OPTIONS, inject: [], useFactory: expect.any(Function) },
        { token: 'AsyncConnectionConnection', useFactory: expect.any(Function), inject: [MONGOOSE_MODULE_OPTIONS] },
      ],
    });
  });

  it('should return the cached class for the same connection name', () => {
    const cachedClass = MongooseModule.forRoot('mongodb://localhost:27017/test', { connectionName: 'TestConnection' });
    expect(cachedClass).toBe(Module);
  });

  it('should return the correct mongoose options', () => {
    const options = moduleMetadata.providers[0].useFactory();
    expect(options).toEqual({ uri: 'mongodb://localhost:27017/test', connectionName: 'TestConnection', appName: 'TestApp' });
  });
});
