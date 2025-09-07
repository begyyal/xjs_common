
export type Ctor<T = any> = { new(): T };
export type IndexSignature = string | number | symbol;
export type NormalRecord<T = any> = Record<IndexSignature, T>;
export type MaybeArray<T = any> = T | T[];
export type MaybePromise<T = any> = T | Promise<T>;
export type Loggable = { log: (msg: any) => void, warn: (msg: any) => void, error: (msg: any) => void };
export type Unique<T = number> = { id: T };
export type IdName<T = number> = { name: string } & Unique<T>;
export type Any = string | number | bigint | boolean | symbol | object | undefined | null;
export interface AlmostArray<E = any> extends ArrayLike<E> {
    /** {@link Array.copyWithin()} */
    copyWithin(target: number, start: number, end?: number): this;
    /** {@link Array.every()} */
    every(predicate: (value: E, index: number, array: this) => unknown, thisArg?: any): boolean;
    /** {@link Array.fill()} */
    fill(value: E, start?: number, end?: number): this;
    /** {@link Array.filter()} */
    filter(predicate: (value: E, index: number, array: this) => any, thisArg?: any): this;
    /** {@link Array.find()} */
    find(predicate: (value: E, index: number, obj: this) => boolean, thisArg?: any): E | undefined;
    /** {@link Array.findIndex()} */
    findIndex(predicate: (value: E, index: number, obj: this) => boolean, thisArg?: any): number;
    /** {@link Array.forEach()} */
    forEach(callbackfn: (value: E, index: number, array: this) => void, thisArg?: any): void;
    /** {@link Array.indexOf()} */
    indexOf(searchElement: E, fromIndex?: number): number;
    /** {@link Array.join()} */
    join(separator?: string): string;
    /** {@link Array.lastIndexOf()} */
    lastIndexOf(searchElement: E, fromIndex?: number): number;
    /** {@link Array.map()} */
    map(callbackfn: (value: E, index: number, array: this) => number, thisArg?: any): this;
    /** {@link Array.reduce()} */
    reduce<U = E>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue?: U): U;
    /** {@link Array.reduceRight()} */
    reduceRight<U = E>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue?: U): U;
    /** {@link Array.reverse()} */
    reverse(): this;
    /** {@link Array.slice()} */
    slice(start?: number, end?: number): this;
    /** {@link Array.some()} */
    some(predicate: (value: E, index: number, array: this) => unknown, thisArg?: any): boolean;
    /** {@link Array.sort()} */
    sort(compareFn?: (a: E, b: E) => number): this;
}
export enum Type {
    string = "string",
    number = "number",
    bigint = "bigint",
    boolean = "boolean",
    symbol = "symbol",
    object = "object",
    undefined = "undefined",
    null = "null"
}
// temporary types until typescript implements negate type.
// https://github.com/microsoft/TypeScript/issues/4196
export type NonString = Exclude<Any, string>;
export type NonNumber = Exclude<Any, number>;
export type NonBigint = Exclude<Any, bigint>;
export type NonBoolean = Exclude<Any, boolean>;
export type NonSymbol = Exclude<Any, symbol>;
export type NonObject = Exclude<Any, object>;
