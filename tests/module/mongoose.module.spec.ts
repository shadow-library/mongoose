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
  const Module = MongooseModule.forRoot('mongodb://localhost:27017/test', { connectionName: 'Test', appName: 'TestApp' });
  const key = Reflect.getMetadataKeys(Module).find(key => key.toString() === 'Symbol(module-metadata)');
  const moduleMetadata = Reflect.getMetadata(key, Module);

  it('should create the connection module with the correct class name', () => {
    expect(Module.name).toBe('MongooseTestConnectionModule');
  });

  it('should create providers for the connection', () => {
    expect(moduleMetadata).toStrictEqual({
      providers: [
        { token: MONGOOSE_MODULE_OPTIONS, useFactory: expect.any(Function) },
        { token: 'TestConnection', useFactory: expect.any(Function), inject: [MONGOOSE_MODULE_OPTIONS] },
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
    const cachedClass = MongooseModule.forRoot('mongodb://localhost:27017/test', { connectionName: 'Test' });
    expect(cachedClass).toBe(Module);
  });

  it('should return the correct mongoose options', () => {
    const options = moduleMetadata.providers[0].useFactory();
    expect(options).toEqual({ uri: 'mongodb://localhost:27017/test', connectionName: 'Test', appName: 'TestApp' });
  });

  it('should throw an error if the connection is not initialized', () => {
    const Module = MongooseModule.forFeature([], { connectionName: 'NonExistentConnection' });
    const key = Reflect.getMetadataKeys(Module).find(key => key.toString() === 'Symbol(module-metadata)');
    const moduleMetadata = Reflect.getMetadata(key, Module);
    const forwardRef = moduleMetadata.imports[0].forwardRef;
    expect(() => forwardRef()).toThrowError('MongooseModule is not initialized for connection: NonExistentConnection');
  });

  it('should create the feature module with the Undefined if no model is provided', () => {
    const modelDefinition: unknown[] = [];
    const modelModule = MongooseModule.forFeature(modelDefinition as any, { connectionName: 'Test' });
    expect(modelModule.name).toBe('MongooseUndefinedModelModule');
  });

  it('should create the feature module with the default class name', () => {
    const modelDefinition = [{ name: 'Test', schema: {} }];
    const modelModule = MongooseModule.forFeature(modelDefinition as any, { connectionName: 'Test' });
    expect(modelModule.name).toBe('MongooseTestModelModule');
  });

  it('should create the feature module with the class name provided', () => {
    const modelDefinition = [{ name: 'Test', schema: {} }];
    const modelModule = MongooseModule.forFeature(modelDefinition as any, { connectionName: 'Test', featureName: 'TestModel' });
    expect(modelModule.name).toBe('MongooseTestModelModule');
  });

  it('should create providers for the models', () => {
    const modelDefinition = [{ name: 'Test', schema: {} }];
    const modelModule = MongooseModule.forFeature(modelDefinition as any, { connectionName: 'Test' });
    const modelKey = Reflect.getMetadataKeys(modelModule).find(key => key.toString() === 'Symbol(module-metadata)');
    const modelModuleMetadata = Reflect.getMetadata(modelKey, modelModule);
    expect(modelModuleMetadata).toStrictEqual({
      imports: [expect.anything()],
      providers: [{ token: 'TestConnection/TestModel', useFactory: expect.any(Function), inject: ['TestConnection'] }],
      exports: ['TestConnection/TestModel'],
    });
  });

  it('should create providers for the discriminators', () => {
    const modelDefinition = [
      {
        name: 'Base',
        schema: {},
        discriminators: [{ name: 'BaseOne', schema: {}, value: 'test' }],
      },
    ];
    const modelModule = MongooseModule.forFeature(modelDefinition as any, { connectionName: 'Test' });
    const modelKey = Reflect.getMetadataKeys(modelModule).find(key => key.toString() === 'Symbol(module-metadata)');
    const modelModuleMetadata = Reflect.getMetadata(modelKey, modelModule);
    expect(modelModuleMetadata).toStrictEqual({
      imports: [expect.anything()],
      providers: [
        { token: 'TestConnection/BaseModel', useFactory: expect.any(Function), inject: ['TestConnection'] },
        { token: 'TestConnection/BaseOneModel', useFactory: expect.any(Function), inject: ['TestConnection/BaseModel'] },
      ],
      exports: ['TestConnection/BaseModel', 'TestConnection/BaseOneModel'],
    });
  });
});
