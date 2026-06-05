import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { exclusive } from "../../../func/decorator/exclusive";
import { delay } from "../../../func/u";
import { UArray } from "../../../func/u-array";

class Cls {
    array: number[] = [];
    @exclusive()
    async exe(s: number, n: number = -1): Promise<void> {
        await delay(s);
        this.array.push(n);
    }
    @exclusive({ semaphore: 2 })
    async exe_smp2(s: number, n: number = -1): Promise<void> {
        await delay(s);
        this.array.push(n);
    }
    @exclusive({ timeoutSec: 1 })
    async exe_to1(s: number, n: number = -1): Promise<void> {
        await delay(s);
        this.array.push(n);
    }
}
const mt = new ModuleTest("T_Exclusive");
mt.appendUnit("exclusive", function (this: TestUnit<{ cls: Cls }>) {
    this.chainContextGen(_ => ({ cls: new Cls() }));
    this.appendCase("basic functionality", async function (this: TestCase, c) {
        c.cls.exe(1, 1);
        await c.cls.exe(0, 2);
        this.check(UArray.eq(c.cls.array, [1, 2], { sort: false }));
    });
    this.appendCase("semaphore works correctly.", async function (this: TestCase, c) {
        c.cls.exe_smp2(2, 1);
        c.cls.exe_smp2(0.5, 2);
        await c.cls.exe_smp2(0, 3);
        this.check(UArray.eq(c.cls.array, [2, 3], { sort: false }), () => c.cls.array);
    });
    this.appendCase("timeout works correctly.", async function (this: TestCase, c) {
        this.expectError();
        c.cls.exe_to1(1, 1);
        await c.cls.exe_to1(0, 2);
    });
}, { concurrent: true });
export const T_Exclusive = mt;
