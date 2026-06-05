import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { Transceiver } from "../../prcs/transceiver";
import { delay, int2array } from "../../func/u";

const mt = new ModuleTest("T_Transceiver");
mt.appendUnit("transceiver", function (this: TestUnit) {
    this.appendCase("basic functionality", async function (this: TestCase) {
        const trcv = new Transceiver<number>();
        const array1: number[] = [], array2: number[] = [];
        let result1 = null, result2 = null;
        trcv.receive(n => array1.push(n));
        trcv.receive(n => array2.push(n));
        trcv.finalize(() => {
            result1 = array1.join(",");
            result2 = array2.join(",");
        });
        trcv.send(3);
        trcv.send(2);
        trcv.send(1);
        await trcv.release();
        this.check(result1 === "3,2,1" && result2 === "3,2,1", () => result1);
    });
    this.appendCase("regist async callbacks.", async function (this: TestCase) {
        const trcv = new Transceiver<number>();
        const array1: number[] = [], array2: number[] = [];
        let result1 = null, result2 = null;
        trcv.receive(n => delay(0.1).then(() => array1.push(n)));
        trcv.receive(n => delay(0.1).then(() => array2.push(n)));
        trcv.finalize(() => delay(0.1).then(() => {
            result1 = array1.join(",");
            result2 = array2.join(",");
        }));
        trcv.send(3);
        trcv.send(2);
        trcv.send(1);
        await trcv.release();
        this.check(result1 === "3,2,1" && result2 === "3,2,1");
    });
    this.appendCase("send many data async and timeout occur.", async function (this: TestCase) {
        const trcv = new Transceiver<number>({ timeoutSec: 3 });
        trcv.receive(_ => delay(0.1));
        trcv.finalize(() => delay(0.1));
        this.expectError();
        int2array(100).forEach(i => trcv.send(i).catch(() => { }));
        await trcv.release();
    });
}, { concurrent: true });
export const T_Transceiver = mt;
