import { IndexSignature, MaybeArray } from "../const/types";
import { UType } from "./u-type";

export namespace Array2 {
    /**
     * generates `Map` object from an array.
     * @param array source array.
     * @param keyGen predicate which generates map keys from a value of the array.
     * @param op.accumulate flag whether values of the map are accumulated or not if key/value from the array conflict. default is true. 
     */
    export function map<K, T>(array: T[], keyGen: (e: T) => K): Map<K, T[]>;
    export function map<K, T>(array: T[], keyGen: (e: T) => K, op: { accumulate: false }): Map<K, T>;
    export function map<K, T>(array: T[], keyGen: (e: T) => K, op?: { accumulate?: boolean }): Map<K, T[]>;
    export function map<K, T>(array: T[], keyGen: (e: T) => K, op?: { accumulate?: boolean }): Map<K, MaybeArray<T>> {
        const _acm = op?.accumulate ?? true;
        const map = new Map<K, MaybeArray<T>>();
        for (const e of array) {
            const k = keyGen(e);
            if (map.has(k)) _acm && (map.get(k) as T[]).push(e);
            else map.set(k, _acm ? [e] : e);
        }
        return map;
    }
    /**
     * generates a record object from an array and mapping functions.
     * @param array entries to be mapped in the object. if only one generator option is specified, this is treated as keys or values.
     * @param op.kgen key generator. if you pass only this, `array` is treated as values.
     * @param op.vgen value generator. if you pass only this, `array` is treated as keys.
     */
    export function record<K extends IndexSignature, V, E>(array: E[], op: { kgen: (e: E) => K, vgen: (e: E) => V }): Record<K, V>;
    export function record<K extends IndexSignature, V>(array: V[], op: { kgen: (v: V) => K }): Record<K, V>;
    export function record<K extends IndexSignature, V>(array: K[], op: { vgen: (k: K) => V }): Record<K, V>;
    export function record<K extends IndexSignature, V, E>(array: (K[] | V[] | E[]), op: { kgen?: (e: V | E) => K, vgen?: (e: K | E) => V }): Record<K, V> {
        return array.reduce((o, e) => {
            const k = op.kgen ? op.kgen(e as V | E) : e as K, v = op.vgen ? op.vgen(e as K | E) : e as V;
            o[k] = v; return o;
        }, {} as Record<K, V>);
    }
    /** sums up numbers in the array. if the array is empty, this returns `0`. */
    export function sum(array: (number | `${number}`)[]): number {
        return array.map(e => UType.isNumber(e) ? e : Number(e)).reduce((a, b) => a + b, 0);
    }
}