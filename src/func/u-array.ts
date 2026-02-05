import { AlmostArray } from "../const/types";
import { Array2 } from "./array2";
import { int2array } from "./u";
import { UType } from "./u-type";

export namespace UArray {
    /** 
     * compares two arrays to valuate equality. 
     * if one side is null or undefined, it returns true when other side is the same.
     * this function has compatibility {@link AlmostArray} like {@link Uint8Array} etc.
     * @param v1 it uses equal operator for comparing elements, so applying object element is not recommended.
     * @param v2 same as v1.
     * @param sort it uses {@link Array.sort()} on v1 and v2 if true. default is true.
     * @param useStrictEqual check equality whether {@link Array} or not and it uses `===` operator for compareing elements if true, otherwise using `==` operator. default is true.
     */
    export function eq(v1: any[] | AlmostArray, v2: any[] | AlmostArray, op: { sort?: boolean, useStrictEqual?: boolean } = {}): boolean {
        const { sort, useStrictEqual } = Object.assign({ sort: true, useStrictEqual: true }, op);
        if (v1 && !v2 || !v1 && v2) return false;
        if (!v1) return true;
        if (v1.length !== v2.length) return false;
        if (useStrictEqual && v1 instanceof Array !== v2 instanceof Array) return false;
        const a = sort ? v1.slice().sort() : v1, b = sort ? v2.slice().sort() : v2;
        return a.every((v: any, i: number) => useStrictEqual ? v === b[i] : v == b[i]);
    }
    /** 
     * returns an array which is removed duplicate of elements.
     * this doesn't mutate the param. 
     */
    export function distinct<T>(array: T[]): T[];
    export function distinct<T>(array: T[],
        op: { k: keyof T, takeLast?: boolean }): T[];
    export function distinct<T>(array: T[],
        op: { predicate: (v1: T, v2: T) => boolean, takeLast?: boolean }): T[]
    export function distinct<T>(array: T[],
        op?: { k?: keyof T, predicate?: (v1: T, v2: T) => boolean, takeLast?: boolean }): T[] {
        if (!array || array.length === 0) return [];
        if (op?.k) return Array.from(Array2.map(array, e => e[op.k]).values()).map(a => op?.takeLast ? a.pop() : a.shift());
        const a = op?.takeLast ? [...array].reverse() : [...array];
        const p = op?.predicate ?? ((v1, v2) => v1 == v2);
        const result = [a.shift()];
        a.forEach(v => result.some(v2 => p(v, v2)) ? {} : result.push(v));
        return result;
    }
    /**
     * returns an array which contains duplicate values of the original array.
     * this doesn't mutate the param. 
     */
    export function duplicate<T>(array: T[]): T[];
    export function duplicate<T>(array: T[], op?: { k?: keyof T }): T[]
    export function duplicate<T>(array: T[], op?: { predicate?: (v1: T, v2: T) => boolean }): T[]
    export function duplicate<T>(array: T[], op?: { k?: keyof T, predicate?: (v1: T, v2: T) => boolean }): T[] {
        if (!array || array.length === 0) return [];
        if (op?.k) return Array.from(Array2.map(array, e => e[op.k]).values()).filter(a => a.length > 1).flat();
        const a = [...array], result = [];
        const p = op?.predicate ?? ((v1, v2) => v1 == v2);
        while (a.length > 0) {
            const e = a.pop();
            let dup: T[] = [];
            for (let i = a.length - 1, e2: T = a[i]; i >= 0; i--, e2 = a[i])
                if (p(e, e2)) { a.splice(i, 1); dup.push(e2); }
            if (dup.length > 0) result.push(...dup, e);
        }
        return result;
    }
    /**
     * chop an array to partial arrays which have specified length. the remainder is added to end of a result.  
     * this function has compatibility to {@link AlmostArray} like {@link Uint8Array} etc.
     */
    export function chop<E>(array: E[], len: number): E[][];
    export function chop<T extends AlmostArray>(array: T, len: number): T[];
    export function chop<T extends AlmostArray>(array: T, len: number): T[] {
        return [...Array(Math.ceil(array.length / len)).keys()]
            .map(i => {
                let endIdx = (i + 1) * len;
                if (endIdx > array.length) endIdx = array.length;
                return array.slice(i * len, endIdx);
            });
    }
    export function remove<T>(array: T[], v: T): void {
        const idx = array.indexOf(v);
        if (idx !== -1) array.splice(idx, 1);
    }
    export function randomPick<T>(array: T[], takeout: boolean = true): T {
        const i = Math.floor(array.length * Math.random());
        const r = array[i];
        if (takeout) array.splice(i, 1);
        return r;
    }
    export function shuffle<T>(array: T[]): T[] {
        const cp = [...array];
        return int2array(array.length).map(_ => randomPick(cp));
    }
    export function takeOut<T>(array: T[], filter: (v: T, i?: number) => boolean): T[] {
        const result = [];
        for (let i = array.length - 1; i >= 0; i--)
            if (filter(array[i], i)) {
                result.unshift(array[i]);
                array.splice(i, 1);
            }
        return result;
    }
    export async function parallelForEach<T, R>(array: T[], predicate: (e: T) => Promise<R>, paraCount: number = 3): Promise<R[]> {
        let ret = [];
        for (const set of UArray.chop(array, paraCount))
            ret.push(...(await Promise.all(set.map(predicate))).filter(UType.isDefined));
        return ret;
    }
}