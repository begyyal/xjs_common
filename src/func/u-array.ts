import { array2map, int2array } from "./u";

export namespace UArray {
    /** 
     * compares two arrays to valuate equality. 
     * if one side is null or undefined, it returns true when other side is the same.
     * @param v1 it uses equal operator for comparing elements, so applying object element is not recommended.
     * @param v2 same as v1.
     * @param sort it uses {@link Array#sort} on v1 and v2 if true. default is true.
     * @param useStrictEqual it uses `===` operator for compareing elements if true, otherwise using `==` operator. default is true.
     */
    export function eq(v1: any[], v2: any[], op: { sort?: boolean, useStrictEqual: false }): boolean;
    export function eq<T>(v1: T[], v2: T[], op: { sort?: boolean, useStrictEqual: true }): boolean;
    export function eq<T>(v1: T[], v2: T[], op: { sort?: boolean }): boolean;
    export function eq<T>(v1: T[], v2: T[]): boolean;
    export function eq<T>(v1: T[], v2: T[], op: { sort?: boolean, useStrictEqual?: boolean } = {}): boolean {
        const { sort, useStrictEqual } = Object.assign({ sort: true, useStrictEqual: true }, op);
        if (v1 && !v2 || !v1 && v2) return false;
        if (!v1) return true;
        if (v1.length !== v2.length) return false;
        const a = sort ? [...v1].sort() : v1, b = sort ? [...v2].sort() : v2;
        return a.every((v, i) => useStrictEqual ? v === b[i] : v == b[i]);
    }
    /** 
     * returns array which is removed duplicate of elements.
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
        if (op?.k) return Array.from(array2map(array, e => e[op.k]).values()).map(a => op?.takeLast ? a.pop() : a.shift());
        const a = op?.takeLast ? [...array].reverse() : [...array];
        const p = op?.predicate ?? ((v1, v2) => v1 == v2);
        const result = [a.shift()];
        a.forEach(v => result.some(v2 => p(v, v2)) ? {} : result.push(v));
        return result;
    }
    export function chop<T>(array: T[], len: number): T[][] {
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
}