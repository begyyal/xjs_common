import { Array2 } from "../../func/array2";
import { UArray } from "../../func/u-array";
import { UType } from "../../func/u-type";
import { genIF_A, genIF_B } from "../sample/func/u";
import { IF_A, IF_B } from "../sample/obj/if-common";
import { ModuleTest, TestCase, TestUnit } from "xjs-test";

const mt = new ModuleTest("T_Array2");
mt.appendUnit("map", function (this: TestUnit<{
    array1: IF_A[],
    array2: IF_B[]
}>) {
    this.chainContextGen(_ => ({ array1: genIF_A(3), array2: genIF_B(3) }));
    this.appendCase("basic functionality.", function (this: TestCase, c) {
        const map = Array2.map([...c.array1!, ...c.array2!], v => v.id);
        this.check(Array.from(map.keys()).length === 3);
        this.check(Array.from(map.values()).every(v => v.length === 2));
    });
    this.appendCase("off accumulation.", function (this: TestCase, c) {
        const map = Array2.map([...c.array1!, ...c.array2!], v => v.id, { accumulate: false });
        this.check(Array.from(map.keys()).length === 3);
        this.check(Array.from(map.values()).every(v => !UType.isArray(v)));
    });
});
mt.appendUnit("invertMap", function (this: TestUnit<{
    map: Map<number, string>
}>) {
    this.chainContextGen(_ => ({ map: new Map([[1, "a"], [2, "b"], [3, "c"], [4, "a"]]) }));
    this.appendCase("basic functionality.", function (this: TestCase, c) {
        const inverse = Array.from(Array2.invertMap(c.map!).entries()).flat();
        this.check(UArray.eq(inverse, ["a", 4, "b", 2, "c", 3]), () => inverse);
    });
    this.appendCase("takeFirst works correctly.", function (this: TestCase, c) {
        const inverse = Array.from(Array2.invertMap(c.map!, { takeFirst: true }).entries()).flat();
        this.check(UArray.eq(inverse, ["a", 1, "b", 2, "c", 3]), () => inverse);
    });
});
mt.appendUnit("record", function (this: TestUnit<{
    numary: number[]
}>) {
    this.chainContextGen(_ => ({ numary: [1, 2, 3] }));
    this.appendCase("basic functionality.", function (this: TestCase, c) {
        const o = Array2.record(c.numary!, { vgen: n => n + "a" });
        this.check(c.numary!.every(n => o[n] === n + "a"));
    });
    this.appendCase("pass values.", function (this: TestCase, c) {
        const o = Array2.record(c.numary!, { kgen: n => n + "a" });
        this.check(c.numary!.every(n => o[n + "a"] === n));
    });
    this.appendCase("pass entries.", function (this: TestCase, c) {
        const o = Array2.record(c.numary!.map(n => [n, n + "v"] as [number, string]), { kgen: e => e[0], vgen: e => e[1] + "2" });
        this.check(c.numary!.every(n => o[n] === n + "v2"));
    });
});
mt.appendUnit("sum", function (this: TestUnit) {
    this.appendCase("basic functionality.", function (this: TestCase) {
        this.check(Array2.sum([1, 2, 3]) === 6);
    });
    this.appendCase("allow string number as the elements.", function (this: TestCase) {
        this.check(Array2.sum([1, "2", "3"]) === 6);
    });
});
export const T_Array2 = mt;