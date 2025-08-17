import { MaybeArray, Type } from "../const/types";
import { smbl_tm, TypeMap, DType, TypeDesc } from "./decorator/d-type";

export namespace UType {
    export function isDefined(v: any): boolean {
        return typeof v !== Type.undefined;
    }
    export function isEmpty(v: any): boolean {
        return v === null || typeof v === Type.undefined;
    }
    export function isString(v: any): v is string { return typeof v === Type.string; }
    export function isNumber(v: any): v is number { return typeof v === Type.number; }
    export function isBigint(v: any): v is bigint { return typeof v === Type.bigint; }
    export function isBoolean(v: any): v is boolean { return typeof v === Type.boolean; }
    export function isSymbol(v: any): v is symbol { return typeof v === Type.symbol; }
    export function isObject(v: any): v is object { return typeof v === Type.object; }
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
     * validate properties which attached decorators in {@link DType}.
     * @param o object to be validated.
     * @returns invalid property keys. returns an empty array if `o` is valid.
     */
    export function validate(o: any): string[] {
        if (!o[smbl_tm]) return [];
        return Object.entries(o[smbl_tm] as TypeMap).flatMap(e => validateProp(e[0], o[e[0]], e[1]));
    }
    function validateProp(k: string, prop: any, td: TypeDesc): string[] {
        if (isEmpty(prop)) return td.req ? [k] : [];
        if (td.t && typeof prop !== td.t) return [k];
        const joinKey = (k2: string) => `${k}.${k2}`;
        if (td.ary) return Array.isArray(prop)
            ? prop.flatMap((e, i) => validateProp(i.toString(), e, td.ary)).map(joinKey) : [k];
        if (td.rcd) return UType.isObject(prop)
            ? Object.entries(prop).flatMap(e => validateProp(e[0], e[1], td.rcd)).map(joinKey) : [k];
        if (td.rec) return validate(prop).flatMap(joinKey);
        return [];
    }
    export function takeAsArray<T>(v: MaybeArray<T>): T[] {
        return Array.isArray(v) ? v : [v];
    }
}