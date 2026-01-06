import { IndexSignature, Loggable, MaybePromise } from "../const/types";
import { XjsErr } from "../obj/xjs-err";
import { UType } from "./u-type";

const s_errCode = 10;

export function getJSTDate(d?: Date | number): Date {
    const adjuster = 9 * 60 * 60 * 1000;
    return UType.isNumber(d) ? new Date(d + adjuster) : new Date((d ? d.getTime() : Date.now()) + adjuster);
}
export function delay(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}
export function int2array(size: number): number[] {
    const s = Number(size);
    if (Number.isNaN(s)) throw new XjsErr(s_errCode, "size of the argument is not number.");
    return Array.from(Array(s).keys());
}
export interface RetryOption<T = MaybePromise> {
    /**
     * number of retries. default is 1.
     */
    count?: number;
    /**
     * logger used for exceptions while retrying the process. default is `console` object.
     */
    logger?: Loggable;
    /**
     * distinguish whether retry is required from exceptions. default is none. (i.e. always required.)
     */
    errorCriterion?: (e: any) => boolean;
    /**
     * predicate that runs between callbacks when retrying.
     */
    intervalPredicate?: () => T;
};
export interface SyncRetryOption extends RetryOption<void> { };
export interface AsyncRetryOption extends RetryOption {
    /**
     * seconds to wait between callbacks. this wait occurs after `intervalPredicate`.
     */
    intervalSec?: number;
};
/**
 * runs callback with customizable retry.
 * @param cb callback to be retried.
 * @param op.count {@link RetryOption.count}
 * @param op.logger {@link RetryOption.logger}
 * @param op.errorCriterion {@link RetryOption.errorCriterion}
 * @param op.intervalSec {@link AsyncRetryOption.intervalSec}
 * @param op.intervalPredicate {@link RetryOption.intervalPredicate}
 */
export function retry<T>(cb: () => T, op?: SyncRetryOption): T;
export function retry<T>(cb: () => T, op?: AsyncRetryOption): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: SyncRetryOption): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: AsyncRetryOption): Promise<T>;
export function retry<T>(cb: () => MaybePromise<T>, op?: SyncRetryOption | AsyncRetryOption): MaybePromise<T> {
    const l = op?.logger ?? console;
    const initialCount = op?.count ?? 1;
    const handleError = (e: any) => {
        if (op?.errorCriterion && !op.errorCriterion(e)) return false;
        l.warn(e); return true;
    };
    const prcs = (c: number, e?: any) => {
        if (c < 0) {
            l.error("failure exceeds retryable count.");
            throw e ?? new XjsErr(s_errCode, "failure exceeds retryable count.");
        }
        let ret = null;
        const innerPrcs = () => {
            try { ret = cb(); } catch (e) { if (handleError(e)) ret = prcs(c - 1, e); else throw e; }
            if (ret instanceof Promise) {
                return new Promise((resolve, reject) =>
                    ret.then(resolve).catch((e: any) => {
                        if (handleError(e)) try { ret = resolve(prcs(c - 1, e)); } catch (e2) { reject(e2); }
                        else reject(e);
                    }));
            } else return ret;
        };
        const chain = (c: () => any) => ret instanceof Promise ? ret.then(() => c()) : c();
        if (c < initialCount) {
            if (op?.intervalPredicate) ret = op?.intervalPredicate();
            const intervalSec = (op as AsyncRetryOption)?.intervalSec;
            if (intervalSec) ret = chain(() => delay(intervalSec));
        }
        return chain(innerPrcs);
    };
    return prcs(initialCount);
}
/**
 * this checks whether the object (**mainly enum**) has the value or not.  
 * if true this returns the value as value type of the object.  
 * ```js
 * enum EnumA {
 *   A = "a",
 *   B = "b"
 * }
 * const enm: EnumA = valueof(EnumA, "a");
 * ```
 */
export function valueof<E extends { [k: string]: IndexSignature }>(o: E, v: IndexSignature): (typeof o)[keyof typeof o] {
    return Object.values(o).find(v2 => v2 === v) as (typeof o)[keyof typeof o];
}
