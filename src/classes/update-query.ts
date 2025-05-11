/**
 * Importing npm packages
 */
import { FilterQuery, UpdateQuery as MongooseUpdateQuery } from 'mongoose';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type UpdatedValue<T> = T extends object ? UpdateDoc<T> : T;

type UpdateArrayValue<T> = T extends (infer U)[] ? T | U : never;

export type UpdateDoc<T extends object> = {
  [K in keyof T]?: undefined extends T[K] ? UpdatedValue<T[K]> | null : UpdatedValue<T[K]>;
};

/**
 * Declaring the constants
 */

export class UpdateQuery<T extends object = any, Doc = UpdateDoc<T>> {
  readonly update: MongooseUpdateQuery<any> = {};

  constructor(obj?: UpdateDoc<T>, isQuery = false) {
    if (!obj) return;
    if (isQuery) this.update = obj;
    else {
      const data = structuredClone(obj);
      this.update.$set = data;
      this.createUnsetFromNulls(data);
    }
  }

  private createUnsetFromNulls(data: Record<string, unknown>, prefix?: string) {
    for (const key of Object.keys(data)) {
      const value = data[key];
      const fieldKey = prefix ? `${prefix}.${key}` : key;
      if (value === null) {
        this.unset(fieldKey);
        delete data[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      } else if (typeof value === 'object' && !Array.isArray(value)) this.createUnsetFromNulls(value as Record<string, unknown>, fieldKey);
    }
  }

  static clone<T extends object>(query: UpdateQuery<T>): UpdateQuery<T> {
    const update = structuredClone(query.update);
    const clone = new UpdateQuery<T>(update, true);
    return clone;
  }

  set<K extends keyof Doc>(key: K, value: Doc[K]): this;
  set(key: string, value: unknown): this;
  set(key: string, value: unknown): this {
    if (value === null) return this.unset(key);
    this.update.$set ??= {};
    this.update.$set[key] = value;
    return this;
  }

  unset<K extends keyof Doc>(key: K): this;
  unset(key: string): this;
  unset(key: string): this {
    this.update.$unset ??= {};
    this.update.$unset[key] = '';
    return this;
  }

  inc<K extends keyof Doc>(key: K, value?: number): this;
  inc(key: string, value?: number): this;
  inc(key: string, value = 1): this {
    this.update.$inc ??= {};
    this.update.$inc[key] = value;
    return this;
  }

  push<K extends keyof Doc>(key: K, value: UpdateArrayValue<Doc[K]>): this;
  push(key: string, value: unknown): this;
  push(key: string, value: unknown): this {
    this.update.$push ??= {};
    this.update.$push[key] = Array.isArray(value) ? { $each: value } : value;
    return this;
  }

  pull<K extends keyof Doc>(key: K, value: Doc[K] | FilterQuery<UpdateArrayValue<Doc[K]>>): this;
  pull(key: string, value: FilterQuery<any> | unknown): this;
  pull(key: string, value: unknown): this {
    this.update.$pull ??= {};
    this.update.$pull[key] = value;
    return this;
  }

  addToSet<K extends keyof Doc>(key: K, value: UpdateArrayValue<Doc[K]>): this;
  addToSet(key: string, value: unknown): this;
  addToSet(key: string, value: unknown): this {
    this.update.$addToSet ??= {};
    this.update.$addToSet[key] = Array.isArray(value) ? { $each: value } : value;
    return this;
  }
}
