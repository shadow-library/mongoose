/**
 * Importing npm packages
 */
import { FactoryProvider } from '@shadow-library/app';
import { ConnectOptions, Connection, MongooseError, Schema } from 'mongoose';
import { Promisable } from 'type-fest';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface MongooseModuleFactoryOptions extends ConnectOptions {
  /** MongoDB URI connection string */
  uri: string;

  /** Factory to add details to the connection, called after the connection to MongoDB is established */
  connectionFactory?: (connection: Connection, name: string) => Connection;

  /** Factory to handle connection errors, called when there is a connection error */
  connectionErrorFactory?: (error: MongooseError) => MongooseError;

  /** Callback function called when a connection is created */
  onConnectionCreate?: (connection: Connection) => void;
}

export interface MongooseModuleOptions extends Omit<MongooseModuleFactoryOptions, 'uri'> {
  /** Name of the connection, if not provided the default connection name will be used */
  connectionName?: string;
}

export interface MongooseModuleAsyncOptions {
  /** Name of the connection, if not provided the default connection name will be used */
  connectionName?: string;

  /** Dependency injection for the factory function */
  inject?: FactoryProvider['inject'];

  /** Factory function to create the options for the module */
  useFactory: (...args: any[]) => Promisable<MongooseModuleFactoryOptions>;
}

export interface DiscriminatorOptions {
  /** Name of the discriminator */
  name: string;

  /** Schema for the discriminator */
  schema: Schema;

  /** The string stored in the discriminatorKey property */
  value?: string;
}

export interface ModelDefinition {
  /** Name of the model */
  name: string;

  /** Mongoose schema for the model */
  schema: Schema;

  /** Mongoose connection for the model */
  collection?: string;

  /** Discriminator options for the model */
  discriminators?: DiscriminatorOptions[];
}

export interface MongooseFeatureOptions {
  /** Name of the connection, if not provided the default connection name will be used */
  connectionName?: string;

  /** Name of the feature, if not provided the first model name will be used */
  featureName?: string;
}
