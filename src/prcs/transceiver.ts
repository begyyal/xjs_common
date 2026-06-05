import { TimeUnit } from "../const/time-unit";
import { MaybePromise } from "../const/types";
import { toMsec, waitFor } from "../func/u";
import { UArray } from "../func/u-array";
import { XjsErr } from "../obj/xjs-err";

const s_errCode = 500;

export class Transceiver<T> {
    private readonly _receivers: { cb: (d: T) => MaybePromise<any>, queues: [number, T][] }[] = [];
    private readonly _finalizers: (() => MaybePromise<any>)[] = [];
    private readonly _timeoutMsec: number;
    private _idGen = 1;
    constructor(op?: { timeoutSec?: number }) {
        this._timeoutMsec = toMsec(op?.timeoutSec ?? 30, TimeUnit.Sec);
    }
    async send(d: T): Promise<void> {
        const id = this._idGen++;
        await Promise.all(this._receivers.map(async r => {
            r.queues.push([id, d]);
            await waitFor(() => r.queues[0][0] === id, {
                timeoutMsec: this._timeoutMsec,
                thrownIfTimeout: () => {
                    UArray.takeOut(r.queues, q => q[0] === id);
                    return new XjsErr(s_errCode, "sending data queue is timeout.");
                }
            });
            try { await r.cb(d); } finally { r.queues.shift(); }
        }));
    }
    receive(cb: (d: T) => MaybePromise<any>): void {
        this._receivers.push({ cb, queues: [] });
    }
    async release(): Promise<void> {
        await Promise.all(this._receivers.map(r => waitFor(() => r.queues.length === 0, {
            timeoutMsec: this._timeoutMsec,
            thrownIfTimeout: () => new XjsErr(s_errCode, "sending data queue is timeout.")
        }))).finally(() => {
            this._receivers.splice(0);
            return Promise.all(UArray.takeOut(this._finalizers, () => true).map(f => f()));
        });
    }
    finalize(cb: () => MaybePromise<any>): void {
        this._finalizers.push(cb);
    }
    async awaitConnections(op?: { count?: number, timeoutMsec?: number }): Promise<void> {
        const _count = op?.count ?? 1;
        await waitFor(() => this._receivers.length >= _count, {
            timeoutMsec: op?.timeoutMsec ?? this._timeoutMsec,
            thrownIfTimeout: () => new XjsErr(s_errCode, "connection was not filled in the time.")
        });
    }
}