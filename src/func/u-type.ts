import { Ctor, MaybeArray, RecursiveKey, Type } from "../const/types";
import { smbl_tm, TypeMap, DType, TypeDesc } from "./decorator/d-type";

export namespace UType {
    export function isDefined(v: any): v is Exclude<any, undefined> {
        return typeof v !== Type.undefined;
    }
    export function isEmpty(v: any): v is (null | undefined) {
        return v === null || typeof v === Type.undefined;
    }
    export function isString(v: any): v is string { return typeof v === Type.string; }
    export function isNumber(v: any): v is number { return typeof v === Type.number; }
    export function isBigint(v: any): v is bigint { return typeof v === Type.bigint; }
    export function isBoolean(v: any): v is boolean { return typeof v === Type.boolean; }
    export function isSymbol(v: any): v is symbol { return typeof v === Type.symbol; }
    /** NOTE: object excluding `null`.  */
    export function isObject(v: any): v is object { return v && typeof v === Type.object; }
    export function isFunction(v: any): v is Function { return typeof v === "function"; }
    export function isArray(v: any, t: Type.string): v is string[];
    export function isArray(v: any, t: Type.number): v is number[];
    export function isArray(v: any, t: Type.bigint): v is bigint[];
    export function isArray(v: any, t: Type.boolean): v is boolean[];
    export function isArray(v: any, t: Type.symbol): v is symbol[];
    export function isArray(v: any, t: Type.object): v is object[];
    export function isArray(v: any): v is any[];
    export function isArray(v: any, t?: Type): v is any[] {
        return Array.isArray(v) && (!t || v.every(e => typeof e === t));
    }
    /** 
     * validates properties decorated with {@link DType}.
     * @param o an object to be validated. if this is a class object decorated with {@link DType}, it can omits `ctor` parameter.
     * @param ctor a class constructor type whose properties are decorated. **NOTE**: it needs to have public constructor without any parameter.
     * @param exclude property keys which are excluded in the validation. {@link RecursiveKey|dot combined notation} is available for specifying nested properties.
     * @returns invalid property keys combined with dot. returns an empty array if `o` is valid.
     */
    export function validate<T extends Exclude<{}, Ctor>>(o: any, ctor?: Ctor<T>, exclude?: RecursiveKey<T>[]): string[] {
        const _o = (!ctor || o instanceof ctor) ? o : Object.assign(new ctor(), o);
        if (!_o[smbl_tm]) return [];
        return Object.entries(_o[smbl_tm] as TypeMap).flatMap(e => validateProp(e[0], _o[e[0]], e[1], exclude));
    }
    function validateProp(k: string, prop: any, td: TypeDesc, exclude?: string[]): string[] {
        if (exclude?.includes(k)) return [];
        if (isEmpty(prop)) return td.req ? [k] : [];
        if (td.t && typeof prop !== td.t) return [k];
        const joinKey = (k2: string) => `${k}.${k2}`;
        const exclude4k = exclude && exclude.filter(ek => ek.startsWith(k + ".")).map(ek => ek.substring(k.length + 1));
        if (td.ary) return Array.isArray(prop)
            ? prop.flatMap((e, i) => validateProp(i.toString(), e, td.ary!, exclude4k)).map(joinKey) : [k];
        if (td.rcd) return UType.isObject(prop)
            ? Object.entries(prop).flatMap(e => validateProp(e[0], e[1], td.rcd!, exclude4k)).map(joinKey) : [k];
        if (td.cls) return validate(prop, td.cls, exclude4k).flatMap(joinKey);
        return [];
    }
    export function takeAsArray<T>(v: MaybeArray<T>): T[] {
        return Array.isArray(v) ? v : [v];
    }
}