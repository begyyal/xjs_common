import { TimeUnit } from "../const/time-unit";
import { MaybePromise } from "../const/types";
import { toMsec, waitFor } from "../func/u";
import { UArray } from "../func/u-array";
import { XjsErr } from "./xjs-err";

const s_errCode = 300;

/**
 * facilitates data transfer across asynchronous tasks.  
 * imagine someone speaks to audiences in the "Hall".
 */
export class Hall<T> {
    private readonly _listener: { cb: (d: T) => MaybePromise<any>, queues: [number, T][] }[] = [];
    private readonly _cleaners: (() => MaybePromise<any>)[] = [];
    private readonly _takingNotesMsec: number;
    private _qidGen = 1;
    /**
     * @param op.takingNotesSec queue processing timeout seconds. (what speak is processed sequentially each audience.) default is 30.
     */
    constructor(op?: { takingNotesSec?: number }) {
        this._takingNotesMsec = toMsec(op?.takingNotesSec ?? 30, TimeUnit.Sec);
    }
    /**
     * speak something to audiences.
     * @param d contents of speak.
     * @returns promise that resolves when all audiences digest what speak so far.
     */
    async speak(d: T): Promise<void> {
        if (this._listener.length === 0) return;
        const qid = this._qidGen++;
        await Promise.all(this._listener.map(async r => {
            r.queues.push([qid, d]);
            await waitFor(() => {
                if (r.queues.length === 0) new XjsErr(s_errCode, "already broke up in this hall.");
                return r.queues[0][0] === qid;
            }, {
                timeoutMsec: this._takingNotesMsec,
                thrownIfTimeout: () => {
                    UArray.takeOut(r.queues, q => q[0] === qid);
                    return new XjsErr(s_errCode, "couldn't keep up with speakings.");
                }
            });
            try { await r.cb(d); } finally { r.queues.shift(); }
        }));
    }
    /**
     * attend for hearing speak.
     * @param cb callback to digest what speak.
     */
    attend(cb: (d: T) => MaybePromise<any>): void {
        this._listener.push({ cb, queues: [] });
    }
    /**
     * break up audiences with cleaning.
     * @returns promise that resolves when all audiences digest what speak so far and complete cleaning.
     */
    async breakUp(): Promise<void> {
        await Promise.all(this._listener.map(r => waitFor(() => r.queues.length === 0, {
            timeoutMsec: this._takingNotesMsec,
            thrownIfTimeout: () => new XjsErr(s_errCode, "xjs hall break up within speakings.")
        }))).finally(() => {
            this._listener.forEach(r => r.queues.splice(0));
            this._listener.splice(0);
            return Promise.all(UArray.takeOut(this._cleaners, () => true).map(f => f()));
        });
    }
    /**
     * assign a cleaner who cleans the hall just after breaking up.
     * @param cb callback to clean the hall.
     */
    assignCleaner(cb: () => MaybePromise<any>): void {
        this._cleaners.push(cb);
    }
    /**
     * await attendance of audiences.
     * @param op.count number of audiences to attend. default is 1.
     * @param op.timeoutSec timeout seconds. default is 30, or `takingNotesSec` if exists.
     */
    async awaitAudience(op?: { count?: number, timeoutSec?: number }): Promise<void> {
        const _count = op?.count ?? 1;
        await waitFor(() => this._listener.length >= _count, {
            timeoutMsec: op?.timeoutSec ? toMsec(op.timeoutSec, TimeUnit.Sec) : this._takingNotesMsec,
            thrownIfTimeout: () => new XjsErr(s_errCode, "audience was not filled within the time.")
        });
    }
    /**
     * await when the hall breaks up.
     * @param op.timeoutMin timeout minutes. default is 60.
     */
    async awaitBreakingUp(op?: { timeoutMin?: number }): Promise<void> {
        let released = false;
        this.assignCleaner(() => released = true);
        await waitFor(() => released, {
            timeoutMsec: toMsec(op?.timeoutMin ?? 60, TimeUnit.Min),
            thrownIfTimeout: () => new XjsErr(s_errCode, "xjs hall didn't break up within the time.")
        });
    }
}