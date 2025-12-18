import { IndexSignature, MaybeArray } from "../const/types";
import { UType } from "./u-type";

export namespace Array2 {
    /**
     * generate `Map` object from an array.
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
     * generate a record object which is mapped by specified keys or values with pair of the entry generated from generator.
     * @param keyOrValues keys or values to be contained in the object.
     * @param op.kgen key generator. if pass this, `keyOrValues` is treated as values.
     * @param op.vgen value generator. if pass this, `keyOrValues` is treated as keys.
     */
    export function record<K extends IndexSignature, V>(keyOrValues: K[], op: { vgen: (k: K) => V }): Record<K, V>;
    export function record<K extends IndexSignature, V>(keyOrValues: V[], op: { kgen: (v: V) => K }): Record<K, V>;
    export function record<K extends IndexSignature, V>(keyOrValues: (K[] | V[]), op: { kgen?: (v: V) => K, vgen?: (k: K) => V }): Record<K, V> {
        return keyOrValues.reduce(!!op.kgen
            ? (o, korv) => { o[op.kgen(korv as V)] = korv as V; return o; }
            : (o, korv) => { o[korv as K] = op.vgen(korv as K); return o; }, {} as Record<K, V>);
    }
    export function sum(array: (number | `${number}`)[]): number {
        return array.map(e => UType.isNumber(e) ? e : Number(e)).reduce((a, b) => a + b, 0);
    }
}