import { TimeUnit } from "../const/time-unit";
import { Loggable, MaybePromise } from "../const/types";
import { XjsErrCode } from "../const/xjs-err-code";
import { XjsErr } from "../obj/xjs-err";

export function delay(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}
export function int2array(size: number): number[] {
    const s = Number(size);
    if (Number.isNaN(s)) throw new XjsErr(XjsErrCode.U, "size of the argument is not number.");
    return Array.from(Array(s).keys());
}
export interface RetryOption<T = any, HT = MaybePromise<boolean>> {
    /**
     * number of retries. default is 1.
     */
    count?: number;
    /**
     * logger used for exceptions while retrying the process. default is `console` object.
     */
    logger?: Loggable;
    /**
     * callback for handling the result of the main callback or an exception. 
     * this callback returns a boolean signifies whether retry is required.
     */
    resultHandler?: (result?: T, exception?: any) => HT;
}
export interface SyncRetryOption<T = any> extends RetryOption<T, boolean> { }
export interface AsyncRetryOption<T = any> extends RetryOption<T> {
    /**
     * seconds to wait between callbacks. this wait occurs after `resultHandler`.
     */
    intervalSec?: number;
}
/**
 * runs callback with customizable retry.
 * @param cb callback to be retried.
 * @param op.count {@link RetryOption.count}
 * @param op.logger {@link RetryOption.logger}
 * @param op.resultHandler {@link RetryOption.resultHandler}
 * @param op.intervalSec {@link AsyncRetryOption.intervalSec}
 */
export function retry<T>(cb: () => T, op?: SyncRetryOption<T>): T;
export function retry<T>(cb: () => T, op?: AsyncRetryOption<T>): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: SyncRetryOption<T>): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: AsyncRetryOption<T>): Promise<T>;
export function retry<T>(cb: () => MaybePromise<T>, op?: SyncRetryOption<T> | AsyncRetryOption<T>): MaybePromise<T> {
    const l = op?.logger ?? console;
    const initialCount = op?.count ?? 1, intervalSec = (op as AsyncRetryOption<T>)?.intervalSec;
    let ret: MaybePromise<T> = null as any, e: any = null;
    const prcs = (c: number): MaybePromise<T> => {
        if (c < 0) {
            l.error("[XJS] failure exceeds retryable count.");
            throw e ?? new XjsErr(XjsErrCode.U, "failure exceeds retryable count.", e);
        }
        if (c < initialCount) {
            l.warn(`[XJS] it does retry of ${initialCount - c}th time to the call back.`);
            if (e) l.warn(e);
        }
        const handleResult = (r?: T, exp?: boolean) => {
            const nextPrcs = () => intervalSec ? delay(intervalSec).then(() => prcs(c - 1)) : prcs(c - 1);
            if (op?.resultHandler) {
                const classify = (hr: boolean) => {
                    if (hr) return nextPrcs();
                    else if (e) throw e;
                    else return r!;
                };
                const hr = op?.resultHandler(r, e);
                if (hr instanceof Promise) return hr.then(classify);
                else return classify(hr);
            } else return exp ? nextPrcs() : r!;
        };
        try {
            ret = cb();
            if (ret instanceof Promise)
                ret = ret.then(r => handleResult(r))
                    .catch(e2 => { e = e2; return handleResult(undefined, true); });
            else ret = handleResult(ret);
        } catch (e2) {
            e = e2; ret = handleResult(undefined, true);
        }
        return ret;
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
 * @param op.intervalMsec interval milliseconds of calling {@link predicate}. default is 100.
 */
export function waitFor(predicate: () => MaybePromise<boolean>, op?: { timeoutMsec?: number, intervalMsec?: number, }): Promise<void> {
    const _timeout = op?.timeoutMsec ?? 30_000;
    const _interval = op?.intervalMsec ?? 100;
    const reservedError = new XjsErr(XjsErrCode.U, "time is over in waitFor()."); // for displaying callstack...
    return new Promise(async (rs, rj) => {
        const limit = Date.now() + _timeout;
        do {
            try {
                if (await predicate()) return rs();
            } catch (e) { rj(e); }
            if (limit > _interval + Date.now()) await delay(_interval / 1000);
            else rj(reservedError);
        } while (limit > Date.now());
        rj(reservedError);
    });
}
