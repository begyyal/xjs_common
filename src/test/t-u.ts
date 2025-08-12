import { Loggable } from "../const/types";
import { delay, int2array, retry } from "../func/u";
import { UArray } from "../func/u-array";

function test_int2array(): void {
    const ary = int2array(3);
    if (ary.length !== 3 || ![0, 1, 2].every(i => ary[i] === i)) throw Error("[int2array] not working.");
    const a: any = "3";
    if (int2array(a).length != 3) throw Error("[int2array] couldn't accept parsable string correctly.");
}
async function test_retry(): Promise<void> {
    const emptyLogger: Loggable = { log: () => { }, warn: () => { }, error: () => { } };
    let ret = null, a = 0, errorCount = 2;
    let cb = () => { a += 1; return a; };
    if (retry(cb, { count: 2, logger: emptyLogger }) !== 1) throw Error("[retry] result value from callback was not returned correctly.");
    cb = () => { a += 1; if (a <= errorCount) throw Error(); return a; };
    ret = null, a = 0;
    try { ret = retry(cb, { count: 2, logger: emptyLogger }); } catch { }
    if (ret !== 3) throw Error("[retry] callback was not retried by default retryable count correctly.");
    ret = null, a = 0;
    try { ret = retry(cb, { logger: emptyLogger }); } catch { /** pass here is correct. */ }
    if (ret != null) throw Error("[retry] specified retry count was not working.");
    let cbAsync = async () => { a += 1; await delay(0); if (a <= errorCount) throw 0; return a; };
    ret = null, a = 0;
    try { ret = await retry(cbAsync, { count: 2, logger: emptyLogger }); } catch { }
    if (ret !== 3) throw Error(`[retry] async callback was not working. ret => ${ret}`);
    ret = null, a = 0;
    try { ret = await retry(cbAsync, { errorCriterion: e => e > 0, logger: emptyLogger }); } catch { /** pass here is correct. */ }
    if (ret != null) throw Error("[retry] error criterion was not working.");
    let array = [];
    cbAsync = async () => { array.push(a); a += 1; await delay(0); if (a <= errorCount) throw 0; return a; };
    ret = null, a = 0;
    try {
        ret = await retry(cbAsync, {
            intervalPredicate: async () => { await delay(0); array.push(-1); },
            errorCriterion: e => e === 0, logger: emptyLogger, count: 2
        });
    } catch { }
    if (!UArray.eq(array, [0, -1, 1, -1, 2], { sort: false }))
        throw Error("[retry] interval predicate was not working.");
    cb = () => { throw 0; };
    array = [Date.now()], ret = null, a = 0;
    try {
        ret = await retry(cb, {
            intervalSec: 0.5,
            intervalPredicate: () => { array.push(Date.now()); },
            errorCriterion: e => e === 0, logger: emptyLogger, count: 2
        });
    } catch { }
    if (!(array[2] - array[1] >= 500 && array[1] - array[0] < 500))
        throw Error("[retry] intervalSec was not working.");
}

export async function T_U(): Promise<void> {
    test_int2array();
    await test_retry();
    console.log("tests in T_U completed.");
}
