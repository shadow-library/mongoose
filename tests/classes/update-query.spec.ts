/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { UpdateQuery } from '@shadow-library/mongoose';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('UpdateQuery', () => {
  class Obj {
    nestedStr: string;

    nestedOptStr?: string;
  }

  class Sample {
    bool: boolean;
    optBool?: boolean;

    str: string;
    optStr?: string;

    num: number;
    optNum?: number;

    date: Date;
    optDate?: Date;

    array: string[];

    obj: Obj;
    optObj?: Obj;
  }

  it('should set unset field when value is null', () => {
    const obj = { str: 'sample', optNum: null };
    const query = new UpdateQuery<Sample>(obj);
    expect(query.update).toStrictEqual({ $set: { str: 'sample' }, $unset: { optNum: '' } });
  });

  it('should set unset nested field when value is null', () => {
    const obj = { str: 'sample', obj: { nestedOptStr: null, nestedStr: 'nested-sample' } };
    const query = new UpdateQuery<Sample>(obj);
    expect(query.update).toStrictEqual({ $set: { str: 'sample', obj: { nestedStr: 'nested-sample' } }, $unset: { 'obj.nestedOptStr': '' } });
  });

  it('should set a field value', () => {
    const obj = { str: 'sample' };
    const query = new UpdateQuery<Sample>(obj);
    query.set('str', 'new-sample');
    query.set('optStr', 'new-sample');
    expect(query.update).toStrictEqual({ $set: { str: 'new-sample', optStr: 'new-sample' } });
  });

  it('should unset a field value', () => {
    const obj = { str: 'sample' };
    const query = new UpdateQuery<Sample>(obj);
    query.unset('optStr');
    expect(query.update).toStrictEqual({ $set: { str: 'sample' }, $unset: { optStr: '' } });
  });

  it('should increment a field value', () => {
    const query = new UpdateQuery<Sample>();
    query.inc('num', 2);
    expect(query.update).toStrictEqual({ $inc: { num: 2 } });
  });

  it('should push a value to an array field', () => {
    const query = new UpdateQuery<Sample>();
    query.push('array', 'new-value');
    expect(query.update).toStrictEqual({ $push: { array: 'new-value' } });
  });

  it('should push multiple values to an array field', () => {
    const query = new UpdateQuery<Sample>();
    query.push('array', ['new-value1', 'new-value2']);
    expect(query.update).toStrictEqual({ $push: { array: { $each: ['new-value1', 'new-value2'] } } });
  });

  it('should pull a value from an array field', () => {
    const query = new UpdateQuery<Sample>();
    query.pull('array', 'value-to-pull');
    expect(query.update).toStrictEqual({ $pull: { array: 'value-to-pull' } });
  });

  it('should add a value to a set field', () => {
    const query = new UpdateQuery<Sample>();
    query.addToSet('array', 'new-value');
    expect(query.update).toStrictEqual({ $addToSet: { array: 'new-value' } });
  });

  it('should add multiple values to a set field', () => {
    const query = new UpdateQuery<Sample>();
    query.addToSet('array', ['new-value1', 'new-value2']);
    expect(query.update).toStrictEqual({ $addToSet: { array: { $each: ['new-value1', 'new-value2'] } } });
  });

  it('should clone an UpdateQuery', () => {
    const obj = { str: 'sample' };
    const query = new UpdateQuery<Sample>(obj);
    const clonedQuery = UpdateQuery.clone(query);
    expect(clonedQuery.update).toStrictEqual({ $set: { str: 'sample' } });
  });
});
