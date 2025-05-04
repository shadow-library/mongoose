/**
 * Importing npm packages
 */
import { beforeAll, beforeEach, describe, expect, it, jest } from 'bun:test';

import { Task, throwError } from '@shadow-library/common';
import mongoose from 'mongoose';

/**
 * Importing user defined packages
 */
import { createConnection, getConnectionToken, getModelToken } from '@lib/module/mongoose.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

beforeAll(() => {
  const originalTaskCreate = Task.create;
  Task.create = (fn: any) => originalTaskCreate(fn).retry(1) as any;
});

describe('Mongoose Utils', () => {
  describe('getModelToken', () => {
    it('should return the correct model token', () => {
      expect(getModelToken('User', 'Auth')).toBe('AuthConnection/UserModel');
    });

    it('should return the correct model token with default connection name', () => {
      expect(getModelToken('User')).toBe('DefaultConnection/UserModel');
    });
  });

  describe('getConnectionToken', () => {
    it('should return the correct connection token', () => {
      expect(getConnectionToken('Auth')).toBe('AuthConnection');
    });

    it('should return the correct connection token with default connection name', () => {
      expect(getConnectionToken()).toBe('DefaultConnection');
    });
  });

  describe('createConnection', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a connection with the given options', async () => {
      mongoose.createConnection = jest.fn(() => ({ asPromise: jest.fn(() => Promise.resolve({})), on: jest.fn() })) as any;
      const connection = await createConnection('TestConnection', { uri: 'mongodb://localhost:27017/test' });
      expect(connection.asPromise).toHaveBeenCalled();
      expect(mongoose.createConnection).toHaveBeenCalledWith('mongodb://localhost:27017/test', {});
    });

    it('should call the connection factory if provided', async () => {
      mongoose.createConnection = jest.fn(() => ({ asPromise: jest.fn(() => Promise.resolve({})), on: jest.fn() })) as any;
      const connectionFactory = jest.fn(connection => connection);
      const onConnectionCreate = jest.fn();
      await createConnection('TestConnection', { uri: 'mongodb://localhost:27017/test', connectionFactory, onConnectionCreate });
      expect(onConnectionCreate).toHaveBeenCalled();
      expect(connectionFactory).toHaveBeenCalled();
    });

    it('should throw an error if the connection fails', async () => {
      const error = new Error('Connection failed');
      mongoose.createConnection = jest.fn(() => ({ asPromise: jest.fn(() => Promise.reject(error)), on: jest.fn() })) as any;
      await expect(createConnection('TestConnection', { uri: 'mongodb://localhost:27017/test' })).rejects.toThrow(error);
    });

    it('should throw an error if the connection fails after calling on error callback', async () => {
      const error = new Error('Connection failed');
      mongoose.createConnection = jest.fn(() => ({ asPromise: jest.fn(() => Promise.reject(error)), on: jest.fn() })) as any;
      const connectionErrorFactory = jest.fn(() => throwError(error));
      await expect(createConnection('TestConnection', { uri: 'mongodb://localhost:27017/test', connectionErrorFactory })).rejects.toThrow(error);
      expect(connectionErrorFactory).toHaveBeenCalled();
    });
  });
});
