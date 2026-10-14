import { TimeUnit } from "../const/time-unit";
import { MaybePromise } from "../const/types";
import { XjsErrCode } from "../const/xjs-err-code";
import { toMsec, waitFor } from "../func/u";
import { UArray } from "../func/u-array";
import { XjsErr } from "./xjs-err";

/**
 * facilitates data transfer across asynchronous tasks.  
 * imagine someone speaks to audiences in the "Hall".
 */
export class Hall<T = void> {
    private readonly _listener: { id: number, cb: (d: T) => MaybePromise<any>, queues: [number, T][] }[] = [];
    private readonly _cleaners: (() => MaybePromise<any>)[] = [];
    private readonly _takingNotesMsec: number;
    private readonly _exceptionHandler: (e: any) => void;
    private _qidTop = 0;
    private _lidTop = 0;
    /** what {@link speak()|spoke} last. */
    currentStatement?: T;
    get isNoAudiences() { return this._listener.length === 0; }
    /**
     * @param op.takingNotesMsec queue processing timeout milliseconds. (what speak is processed sequentially each audience.) default is 30 seconds.
     * @param op.exceptionHandler this handles every exceptions that occur within the callbacks of the hall.
     */
    constructor(op?: { takingNotesMsec?: number, exceptionHandler?: (e: any) => void }) {
        this._takingNotesMsec = op?.takingNotesMsec ?? toMsec(30, TimeUnit.Sec);
        this._exceptionHandler = op?.exceptionHandler ? ((e: any) => {
            try { op.exceptionHandler!(e); } catch (e2) { console.error("[XJS] failover in the exception handler of the hall.", e2); }
        }) : ((e: any) => console.error(e));
    }
    /**
     * speaks something to audiences.
     * @param d contents of speak.
     * @returns promise that resolves when all audiences digest what speak so far.
     */
    async speak(d: T): Promise<void> {
        this.currentStatement = d;
        const qid = ++this._qidTop;
        if (this._listener.length === 0) return;
        await Promise.all(this._listener.map(async r => {
            r.queues.push([qid, d]);
            await waitFor(() => {
                if (r.queues.length === 0) throw new XjsErr(XjsErrCode.Hall, "already broke up in this hall.");
                return r.queues[0][0] === qid;
            }, { timeoutMsec: this._takingNotesMsec }).catch(e => {
                if (e instanceof XjsErr && e.code === 10) {
                    UArray.takeOut(r.queues, q => q[0] === qid);
                    return new XjsErr(XjsErrCode.Hall, "couldn't keep up with speakings.");
                } else throw e;
            });
            try { await r.cb(d); }
            catch (e) { this._exceptionHandler(e); }
            finally { r.queues.shift(); }
        }));
    }
    /**
     * attends for hearing speak.
     * @param cb callback to digest what speak.
     * @returns a tuple contains seat number and a promise object which resolves after processing precedent statement. 
     * it can takes seat number for {@link leave()} to remove the callback.
     */
    attend(cb: (d: T) => MaybePromise<any>): { seatNum: number, keepUpPrms: Promise<void> } {
        const queues: [number, T][] = [], d = this.currentStatement;
        this._listener.push({ id: ++this._lidTop, cb, queues });
        let keepUpPrms: Promise<void>;
        if (this._qidTop > 0) {
            queues.push([this._qidTop, d!]);
            keepUpPrms = (async () => {
                try { await cb(d!); }
                catch (e) { this._exceptionHandler(e); }
                finally { queues.shift(); }
            })();
        } else keepUpPrms = Promise.resolve();
        return { seatNum: this._lidTop, keepUpPrms };
    }
    /**
     * leaves seat for removing the callback.
     * @param seatNum audience id returned from {@link attend()}.
     */
    leave(seatNum: number): void {
        const leaved = UArray.takeOut(this._listener, l => l.id === seatNum)[0];
        if (leaved) leaved.queues.splice(0);
    }
    /**
     * breaks up audiences with cleaning.
     * @returns promise that resolves when all audiences digest what speak so far and complete cleaning.
     */
    async breakUp(): Promise<void> {
        this._qidTop = 0;
        this.currentStatement = undefined;
        await Promise.all(this._listener.map(r => waitFor(() => r.queues.length === 0, {
            timeoutMsec: this._takingNotesMsec
        }).catch(e => {
            if (e instanceof XjsErr && e.code === 10) throw new XjsErr(XjsErrCode.Hall, "xjs hall break up within speakings.");
            else throw e;
        }))).finally(async () => {
            this._listener.forEach(r => r.queues.splice(0));
            this._listener.splice(0);
            for (const c of this._cleaners.splice(0))
                try { await c(); } catch (e) { this._exceptionHandler(e); }
        });
    }
    /**
     * assigns a cleaner who cleans the hall just after breaking up.
     * @param cb callback to clean the hall.
     */
    assignCleaner(cb: () => MaybePromise<any>): void {
        this._cleaners.push(cb);
    }
    /**
     * awaits attendance of audiences.
     * @param op.count number of audiences to attend. default is 1.
     * @param op.timeoutMsec timeout milliseconds. default is 30 seconds, or `takingNotesMsec` if exists.
     */
    async awaitAudience(op?: { count?: number, timeoutMsec?: number }): Promise<void> {
        const _count = op?.count ?? 1;
        await waitFor(() => this._listener.length >= _count, { timeoutMsec: op?.timeoutMsec ?? this._takingNotesMsec }).catch(e => {
            if (e instanceof XjsErr && e.code === XjsErrCode.U) throw new XjsErr(XjsErrCode.Hall, "audience was not filled within the time.");
            else throw e;
        });
    }
    /**
     * awaits when the hall breaks up.
     * @param op.timeoutMsec timeout milliseconds. default is an hour.
     */
    async awaitBreakingUp(op?: { timeoutMsec?: number }): Promise<void> {
        if (this._listener.length === 0) return;
        let released = false;
        this.assignCleaner(() => released = true);
        await waitFor(() => released, { timeoutMsec: op?.timeoutMsec ?? toMsec(1, TimeUnit.Hour) }).catch(e => {
            if (e instanceof XjsErr && e.code === XjsErrCode.U) throw new XjsErr(XjsErrCode.Hall, "xjs hall didn't break up within the time.");
            else throw e;
        });
    }
}