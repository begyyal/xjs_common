
export type Ctor<T = any> = { new(): T };
export type IndexSignature = string | number | symbol;
/** includes first, excludes last. */
export type NumericRange<S extends number, E extends number, A extends number[] = [], R extends number = never> =
    A["length"] extends E
    ? S | R
    : NumericRange<S, E, [...A, 1], A[S] extends undefined ? never : R | A["length"]>;
type depthMap = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
/** 
 * accepts hierarchical properties notation combined with a delimiter (default is dot). \
 * for suppressing an error due to infinite type evaluation, count of hierarchy is limited under `9`. default is `5`.
 */
export type RecursiveKey<T extends object, DP extends NumericRange<0, 10> = 5, DL extends string = "."> = DP extends never ? never : {
    [k in keyof T & (string | number)]: NonNullable<T[k]> extends any[]
    ? `${k}` | `${k}${DL}${RecursiveKey<NonNullable<T[k]>[number], depthMap[DP], DL>}`
    : NonNullable<T[k]> extends object
    ? `${k}` | `${k}${DL}${RecursiveKey<NonNullable<T[k]>, depthMap[DP], DL>}`
    : `${k}`;
}[keyof T & (string | number)];
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
