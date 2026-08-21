import { ModuleTest, s_emptyLogger, TestCase, TestUnit } from "xjs-test";
import { TimeUnit } from "../../const/time-unit";
import { delay, int2array, retry, toMsec, waitFor } from "../../func/u";

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
mt.appendUnit("retry", function (this: TestUnit<{
    counter: number,
    errorCount: number,
    array: number[];
    cb: () => any,
    cbAsync: () => Promise<any>
}>) {
    this.chainContextGen(c => ({
        counter: 0,
        errorCount: 2,
        array: [],
        cb: () => { c.counter! += 1; return c.counter; }
    }));
    this.appendCase("result value from callback is returned correctly.", function (this: TestCase, c) {
        this.check(retry(c.cb!, { count: 2, logger: s_emptyLogger }) === 1);
    }, { concurrent: true });
    this.appendCase("handling a result using resultHandler.", function (this: TestCase, c) {
        this.check(retry(c.cb!, { count: 2, resultHandler: r => r === 1, logger: s_emptyLogger }) === 2);
    }, { concurrent: true });
    this.chainContextGen(c => ({
        cb: () => {
            c.counter! += 1;
            if (c.counter! <= c.errorCount!) throw c.counter;
            return c.counter;
        }
    }));
    this.appendCase("callback is retried by default retryable count correctly.", function (this: TestCase, c) {
        this.expectError(e => e === 2);
        retry(c.cb!, { logger: s_emptyLogger });
    }, { concurrent: true });
    this.appendCase("specified retry count is working.", function (this: TestCase, c) {
        const ret = retry(c.cb!, { count: 2, logger: s_emptyLogger });
        this.check(ret === 3);
    }, { concurrent: true });
    this.chainContextGen(c => ({
        cbAsync: async () => {
            c.array!.push(c.counter!);
            await delay(0.001).then(() => c.counter! += 1);
            if (c.counter! <= c.errorCount!) throw 1;
            return c.counter;
        }
    }));
    this.appendCase("async callback is working.", async function (this: TestCase, c) {
        const ret = await retry(c.cbAsync!, { count: 2, logger: s_emptyLogger });
        this.check(ret === 3);
    }, { concurrent: true });
    this.appendCase("handling an exception using resultHandler.", async function (this: TestCase, c) {
        try { await retry(c.cbAsync!, { resultHandler: (_, e) => e != 1, logger: s_emptyLogger }); } catch { /** pass here is correct. */ }
        this.check(c.counter === 1);
    }, { concurrent: true });
    this.chainContextGen(() => ({
        cb: () => { throw 1; },
        array: [Date.now()]
    }));
    this.appendCase("intervalSec is working.", async function (this: TestCase, c) {
        await retry(c.cb!, {
            intervalSec: 0.6,
            resultHandler: (_, e) => {
                c.array!.push(Date.now());
                return e === 1;
            }, logger: s_emptyLogger, count: 2
        }).catch(() => { });
        // set 50 msec as trelance of time error...
        this.check(c.array![1] - c.array![0] < 550, () => c.array![1] - c.array![0]);
        this.check(c.array![2] - c.array![1] >= 550, () => c.array![2] - c.array![1]);
    }, { concurrent: true });
    this.appendCase("async resultHandler works correctly.", async function (this: TestCase, c) {
        await retry(c.cb!, {
            resultHandler: async (_, e) => {
                await delay(0.5);
                c.array!.push(Date.now());
                return e === 1;
            }, logger: s_emptyLogger, count: 2
        }).catch(() => { });
        // set 50 msec as trelance of time error...
        this.check(c.array![2] - c.array![0] > 950, () => c.array![2] - c.array![0]);
    }, { concurrent: true });
}, { concurrent: true });
mt.appendUnit("toMsec", function (this: TestUnit) {
    this.appendCase("convert seconds.", function (this: TestCase) {
        this.check(toMsec(3, TimeUnit.Sec) === 3000);
    });
    this.appendCase("convert minutes.", function (this: TestCase) {
        this.check(toMsec(3, TimeUnit.Min) === 3 * 1000 * 60);
    });
    this.appendCase("convert hours.", function (this: TestCase) {
        this.check(toMsec(3, TimeUnit.Hour) === 3 * 1000 * 60 * 60);
    });
    this.appendCase("convert days.", function (this: TestCase) {
        this.check(toMsec(3, TimeUnit.Day) === 3 * 1000 * 60 * 60 * 24);
    });
});
mt.appendUnit("waitFor", function (this: TestUnit) {
    this.appendCase("basic functionality.", async function (this: TestCase) {
        let a = 0;
        setTimeout(() => a = 1, 100);
        await waitFor(() => a > 0);
        this.check(a === 1);
    });
    this.appendCase("timeout occurs.", async function (this: TestCase) {
        let a = 0;
        this.expectError();
        await waitFor(() => a > 0, { timeoutMsec: 100 });
    });
    this.appendCase("set interval msec.", async function (this: TestCase) {
        let a = 0, b = 0;
        delay(1).then(() => a++);
        await waitFor(() => ++b > 0 && a > 0, { intervalMsec: 600 });
        this.check(b === 3);
    });
    this.appendCase("pass async callback.", async function (this: TestCase) {
        let a = 0;
        await waitFor(async () => delay(1.5).then(() => a++ > 2), { timeoutMsec: 2_000, intervalMsec: 1_000 }).catch(() => { });
        this.check(a === 1, () => a);
    });
}, { concurrent: true });
export const T_U = mt;
