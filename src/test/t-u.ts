import { delay, int2array, retry } from "../func/u";
import { UArray } from "../func/u-array";
import { s_emptyLogger } from "./const/test-helper";
import { ModuleTest } from "./prc/module-test";
import { TestCase } from "./prc/test-case";
import { TestUnit } from "./prc/test-unut";

const mt = new ModuleTest("T_U");
mt.appendUnit("int2array", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const ary = int2array(3);
        this.check(ary.length === 3 && [0, 1, 2].every(i => ary[i] === i));
    });
    this.appendCase("accept parsable string correctly.", function (this: TestCase) {
        const a: any = "3";
        this.check(int2array(a).length === 3);
    });
});
mt.appendUnit("retry", async function (this: TestUnit<{
    ret: any,
    counter: number,
    errorCount: number,
    array: number[];
    cb?: () => any,
    cbAsync?: () => Promise<any>
}>) {
    this.chainContextGen(c => ({
        ret: null,
        counter: 0,
        errorCount: 2,
        array: [],
        cb: () => { c.counter += 1; return c.counter; }
    }));
    this.appendCase("result value from callback was returned correctly.", function (this: TestCase, c) {
        this.check(retry(c.cb, { count: 2, logger: s_emptyLogger }) === 1);
    });
    this.chainContextGen(c => ({
        cb: () => {
            c.counter += 1;
            if (c.counter <= c.errorCount) throw Error();
            return c.counter;
        }
    }));
    this.appendCase("specified retry count was working.", function (this: TestCase, c) {
        try { c.ret = retry(c.cb, { count: 2, logger: s_emptyLogger }); } catch { }
        this.check(c.ret === 3);
    });
    this.appendCase("callback was retried by default retryable count correctly.", function (this: TestCase, c) {
        try { c.ret = retry(c.cb, { logger: s_emptyLogger }); } catch { /** pass here is correct. */ }
        this.check(c.ret === null);
    });
    this.chainContextGen(c => ({
        cbAsync: async () => {
            c.array.push(c.counter);
            c.counter += 1;
            await delay(0.001);
            if (c.counter <= c.errorCount) throw 1;
            return c.counter;
        }
    }));
    this.appendCase("handle an error in async retry.", async function (this: TestCase, c) {
        this.expectError(e => e === 1);
        c.ret = await retry(c.cbAsync, { logger: s_emptyLogger });
    });
    this.appendCase("async callback was working.", async function (this: TestCase, c) {
        try { c.ret = await retry(c.cbAsync, { count: 2, logger: s_emptyLogger }); } catch { }
        this.check(c.ret === 3, () => `ret => ${c.ret}`);
    });
    this.appendCase("error criterion was working.", async function (this: TestCase, c) {
        try { c.ret = await retry(c.cbAsync, { errorCriterion: e => e > 0, logger: s_emptyLogger }); } catch { /** pass here is correct. */ }
        this.check(c.ret === null);
    });
    this.appendCase("interval predicate was working.", async function (this: TestCase, c) {
        try {
            c.ret = await retry(c.cbAsync, {
                intervalPredicate: async () => { await delay(0.001); c.array.push(-1); },
                errorCriterion: e => e === 1, logger: s_emptyLogger, count: 2
            });
        } catch { }
        this.check(UArray.eq(c.array, [0, -1, 1, -1, 2], { sort: false }));
    });
    this.chainContextGen(() => ({
        cb: () => { throw 1; },
        array: [Date.now()]
    }));
    this.appendCase("intervalSec was working.", async function (this: TestCase, c) {
        try {
            c.ret = await retry(c.cb, {
                intervalSec: 0.5,
                intervalPredicate: () => { c.array.push(Date.now()); },
                errorCriterion: e => e === 1, logger: s_emptyLogger, count: 2
            });
        } catch { }
        this.check(c.array[2] - c.array[1] >= 500 && c.array[1] - c.array[0] < 500);
    });
});
export const T_U = mt;
