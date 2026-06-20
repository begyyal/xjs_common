import { TimeUnit } from "../const/time-unit";
import { Loggable, MaybePromise } from "../const/types";
import { XjsErr } from "../obj/xjs-err";

const s_errCode = 10;

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
     * distinguishes whether retry is required from exceptions. default is none. (i.e. always required.)
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
    const handleError = (e: any) => !op?.errorCriterion || op.errorCriterion(e);
    const prcs = (c: number, e?: any) => {
        if (c < 0) {
            l.error("[XJS] failure exceeds retryable count.");
            throw e ?? new XjsErr(s_errCode, "failure exceeds retryable count.", e);
        }
        if (e) {
            l.warn(`[XJS] it does retry of ${initialCount - c}th time to the call back.`);
            l.warn(e);
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
export function toMsec(value: number, unit: TimeUnit.Sec | TimeUnit.Min | TimeUnit.Hour | TimeUnit.Day): number {
    let v = value;
    if (unit <= TimeUnit.Sec) v *= 1000;
    if (unit <= TimeUnit.Min) v *= 60;
    if (unit <= TimeUnit.Hour) v *= 60;
    if (unit <= TimeUnit.Day) v *= 24;
    return v;
}
/**
 * waits for that a callback returns true.
 * @param predicate callback to return true when completes.
 * @param op.timeoutMsec timeout milliseconds. default is 30 seconds.
 * @param op.thrownIfTimeout callback to generate something to be thrown when rejected.
 * @param op.intervalMsec interval milliseconds of calling {@link predicate}. default is 100.
 */
export function waitFor(predicate: () => boolean, op?: { timeoutMsec?: number, thrownIfTimeout?: () => any, intervalMsec?: number, }): Promise<void> {
    const _timeout = op?.timeoutMsec ?? 30_000;
    const _interval = op?.intervalMsec ?? 100;
    return new Promise((rs, rj) => {
        let toRj = null, toRs = null;
        const clear = () => { clearInterval(toRs); clearTimeout(toRj); }
        toRj = setTimeout(() => {
            clear();
            rj(op?.thrownIfTimeout ? op.thrownIfTimeout() : new XjsErr(s_errCode, "time is over in waitFor()."));
        }, _timeout);
        toRs = setInterval(() => {
            try {
                if (predicate()) { clear(); rs(); }
            } catch (e) { clear(); rj(e); }
        }, _interval);
    });
}
