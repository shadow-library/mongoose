/**
 * Importing npm packages
 */
import { Task, tryCatch, utils } from '@shadow-library/common';
import mongoose, { Connection } from 'mongoose';

/**
 * Importing user defined packages
 */
import { DEFAULT_CONNECTION_NAME } from '@lib/constants';

import { MongooseModuleFactoryOptions } from './mongoose.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function getModelToken(model: string, connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  const modelToken = `${model}Model`;
  return `${connectionToken}/${modelToken}`;
}

export function getConnectionToken(name?: string): string {
  if (!name) name = DEFAULT_CONNECTION_NAME;
  return `${name}Connection`;
}

export async function createConnection(connectionName: string, opts: MongooseModuleFactoryOptions): Promise<Connection> {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  const onConnectionCreate = opts.onConnectionCreate || (() => {});
  const connectionErrorFactory = opts.connectionErrorFactory || (error => error);
  const connectionFactory = opts.connectionFactory || (connection => connection);

  const mongooseOptions = utils.object.omitKeys(opts, ['uri', 'connectionFactory', 'connectionErrorFactory', 'onConnectionCreate']);
  const connection = mongoose.createConnection(opts.uri, mongooseOptions);
  onConnectionCreate(connection);

  const task = Task.create(() => connection.asPromise()).name('MongooseConnection');
  const result = await tryCatch(() => task.execute());
  if (!result.success) throw connectionErrorFactory(result.error);
  return connectionFactory(connection, connectionName);
}
