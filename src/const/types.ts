
export type IndexSignature = string | number | symbol;
export type NormalRecord<T = any> = Record<IndexSignature, T>;
export type MaybeArray<T = any> = T | T[];
export type MaybePromise<T = void> = T | Promise<T>;
export type Loggable = { log: (msg: any) => void, warn: (msg: any) => void, error: (msg: any) => void };
export type Unique<T = number> = { id: T };
export type IdName<T = number> = { name: string } & Unique<T>;
export type Any = string | number | bigint | boolean | symbol | object | undefined | null;
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
