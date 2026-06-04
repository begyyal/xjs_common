import { TimeUnit } from "../const/time-unit";
import { MaybePromise } from "../const/types";
import { toMsec, waitFor } from "../func/u";
import { XjsErr } from "../obj/xjs-err";

const s_errCode = 500;

export class Transceiver<T> {
    private readonly _receivers: ((d: T) => MaybePromise<void>)[] = [];
    private readonly _timeoutMsec = toMsec(30, TimeUnit.Sec);
    constructor() { }
    send(d: T): void {
        this._receivers.forEach(r => r(d));
    }
    receive(cb: (d: T) => MaybePromise<void>): void {
        this._receivers.push(cb);
    }
    async awaitConnections(op?: { count?: number, timeoutMsec?: number }): Promise<void> {
        const _count = op?.count ?? 1;
        await waitFor(() => this._receivers.length >= _count, {
            timeoutMsec: op?.timeoutMsec ?? this._timeoutMsec,
            thrownIfTimeout: () => new XjsErr(s_errCode, "connection was not filled in the time.")
        });
    }
}