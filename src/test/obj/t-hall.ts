import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { Hall } from "../../obj/hall";
import { delay, int2array } from "../../func/u";

const mt = new ModuleTest("T_Hall");
mt.appendUnit("hall", function (this: TestUnit) {
    this.appendCase("basic functionality", async function (this: TestCase) {
        const trcv = new Hall<number>();
        const array1: number[] = [], array2: number[] = [];
        let result1 = null, result2 = null;
        trcv.attend(n => array1.push(n));
        trcv.attend(n => array2.push(n));
        trcv.assignCleaner(() => {
            result1 = array1.join(",");
            result2 = array2.join(",");
        });
        trcv.speak(3);
        trcv.speak(2);
        trcv.speak(1);
        await trcv.breakUp();
        this.check(result1 === "3,2,1" && result2 === "3,2,1", () => result1);
    });
    this.appendCase("regist async callbacks.", async function (this: TestCase) {
        const hall = new Hall<number>();
        const array1: number[] = [], array2: number[] = [];
        let result1 = null, result2 = null;
        hall.attend(n => delay(0.1).then(() => array1.push(n)));
        hall.attend(n => delay(0.1).then(() => array2.push(n)));
        hall.assignCleaner(() => delay(0.1).then(() => {
            result1 = array1.join(",");
            result2 = array2.join(",");
        }));
        hall.speak(3);
        hall.speak(2);
        hall.speak(1);
        await hall.breakUp();
        this.check(result1 === "3,2,1" && result2 === "3,2,1");
    });
    this.appendCase("send many data async and timeout occur.", async function (this: TestCase) {
        const hall = new Hall<number>({ takingNotesSec: 3 });
        hall.attend(_ => delay(0.1));
        hall.assignCleaner(() => delay(0.1));
        this.expectError();
        int2array(100).forEach(i => hall.speak(i).catch(() => { }));
        await hall.breakUp();
    });
    this.appendCase("await audience.", async function (this: TestCase) {
        const hall = new Hall<number>();
        let attended = false;
        delay(1).then(() => {
            hall.attend(() => { });
            attended = true;
        });
        await hall.awaitAudience();
        this.check(attended);
    });
    this.appendCase("await breaking up.", async function (this: TestCase) {
        const hall = new Hall<number>();
        let rcv = false;
        hall.attend(() => delay(1).then(() => rcv = true));
        hall.speak(1);
        hall.breakUp();
        await hall.awaitBreakingUp();
        this.check(rcv);
    });
}, { concurrent: true });
export const T_Hall = mt;
