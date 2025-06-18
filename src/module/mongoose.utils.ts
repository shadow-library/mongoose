/**
 * Importing npm packages
 */
import { Logger, Task, tryCatch, utils, withThis } from '@shadow-library/common';
import mongoose, { Collection, Connection } from 'mongoose';

/**
 * Importing user defined packages
 */
import { DEFAULT_CONNECTION_NAME, NAMESPACE } from '@lib/constants';

import { MongooseModuleFactoryOptions } from './mongoose.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
export const logger = Logger.getLogger(NAMESPACE, 'Mongoose');

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

  /** Handling mongoose connection events */
  const connectionCloseHandler = withThis((conn: Connection) => logger.info(`mongodb connection to database '${conn.db?.databaseName}' closed`));
  const connectionErrorHandler = withThis((conn: Connection) => logger.error(`mongodb connection to database '${conn.db?.databaseName}' error`));
  const connectionConnectedHandler = withThis((conn: Connection) => logger.info(`mongodb connection to database '${conn.db?.databaseName}' connected`));
  const connectionDisconnectedHandler = withThis((conn: Connection) => logger.warn(`mongodb connection to database '${conn.db?.databaseName}' disconnected`));
  connection.on('close', connectionCloseHandler);
  connection.on('error', connectionErrorHandler);
  connection.on('connected', connectionConnectedHandler);
  connection.on('disconnected', connectionDisconnectedHandler);

  const task = Task.create(() => connection.asPromise()).name('MongooseConnection');
  const result = await tryCatch(() => task.execute());
  if (!result.success) throw connectionErrorFactory(result.error);
  return connectionFactory(connection, connectionName);
}

export function mongooseDebugLogger(this: Collection, collectionName: string, methodName: string, ...methodArgs: any[]): void {
  const args: string[] = [];
  for (const value of methodArgs) args.push(this.$format(value));
  logger.debug(`(${this.dbName}) db.${collectionName}.${methodName}(${args.join(', ')})`);
}
