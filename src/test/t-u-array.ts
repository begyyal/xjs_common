import { AlmostArray } from "../const/types";
import { int2array } from "../func/u";
import { UArray } from "../func/u-array";
import { genIF_A } from "./func/u";
import { IF_A } from "./obj/if-common";
import { ModuleTest } from "./prc/module-test";
import { TestCase } from "./prc/test-case";
import { TestUnit } from "./prc/test-unut";

const mt = new ModuleTest("T_UArray");
mt.appendUnit("distinct", function (this: TestUnit<{
    rcds: IF_A[],
    array: number[],
    before: number
}>) {
    this.chainContextGen(_ => ({ rcds: genIF_A(3) }));
    this.chainContextGen(c => ({ before: c.rcds.length }));
    this.appendCase("basic functionality with property key.", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(3));
        c.rcds = UArray.distinct(c.rcds, { k: "id" });
        this.check(c.rcds.length === c.before, () => `lengh change ${c.before} -> ${c.rcds.length}`);
    });
    this.appendCase("take first element with property key.", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(3));
        c.rcds[0].a = "z";
        c.rcds = UArray.distinct(c.rcds, { k: "id" });
        this.check(c.rcds.find(r => r.id === 0).a === "z");
    });
    this.appendCase("basic functionality with filter predicate.", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(3));
        c.rcds = UArray.distinct(c.rcds, { predicate: (v1, v2) => v1.id === v2.id });
        this.check(c.rcds.length === c.before, () => `lengh change ${c.before} -> ${c.rcds.length}`);
    });
    this.appendCase("take first element with filter predicate.", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(3));
        c.rcds[0].a = "z";
        c.rcds = UArray.distinct(c.rcds, { predicate: (v1, v2) => v1.id === v2.id });
        this.check(c.rcds.find(r => r.id === 0).a === "z");
    });
    this.appendCase("take last element.", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(3));
        c.rcds[0].a = "z";
        c.rcds = UArray.distinct(c.rcds, { k: "id", takeLast: true });
        this.check(c.rcds.find(r => r.id === 0).a !== "z");
    });
    this.chainContextGen(_ => ({ array: [1, 2, 4, 1, 2, 3, 6, 7, 3, 4, 6, 9, 2, 5, 0, 8] }))
    this.appendCase("basic functionality with number array.", function (this: TestCase, c) {
        this.check(UArray.distinct(c.array).length === 10);
    });
    this.appendCase("basic functionality with string array.", function (this: TestCase, c) {
        this.check(UArray.distinct(c.array.map(n => n.toString())).length === 10);
    });
    this.clearContextGen();
    this.chainContextGen(_ => ({ rcds: genIF_A(10000) }));
    this.appendCase("keybase processing compress the time significantly. (the ratio less than 3 times)", function (this: TestCase, c) {
        c.rcds.push(...genIF_A(10000));
        const rcds_b = [...c.rcds];
        let t = Date.now();
        UArray.distinct(c.rcds, { k: "id" });
        const timeKeybase = Date.now() - t;
        t = Date.now();
        UArray.distinct(rcds_b, { predicate: (v1, v2) => v1.id === v2.id });
        this.check(timeKeybase * 3 < (Date.now() - t));
    });
});
mt.appendUnit("duplicate", function (this: TestUnit<{
    array1: number[],
    array2: IF_A[]
}>) {
    this.chainContextGen(_ => ({ array1: [1, 2, 2, 3, 4, 5, 5], array2: [...genIF_A(3), ...genIF_A(1)] }));
    this.appendCase("basic functionality.", function (this: TestCase, c) {
        this.check(UArray.eq(UArray.duplicate(c.array1), [2, 2, 5, 5]));
    });
    this.appendCase("basic functionality with property key.", function (this: TestCase, c) {
        const ret = UArray.duplicate(c.array2, { k: "id" });
        this.check(ret.length === 2 && ret.every(a => a.id === 0));
    });
    this.appendCase("basic functionality with filter predicate.", function (this: TestCase, c) {
        c.array2[0].a = "x";
        const ret = UArray.duplicate(c.array2, { predicate: (a, b) => a.a === b.a });
        this.check(ret.length === 3 && UArray.eq(ret.map(a => a.id), [0, 1, 2]));
    });
});
mt.appendUnit("eq", function (this: TestUnit<{
    array1: number[],
    array2: number[],
    array3: number[],
    aa: AlmostArray,
}>) {
    this.chainContextGen(_ => ({
        array1: [1, 2, 3],
        array2: [1, 3, 2],
        array3: [],
        aa: new Uint8Array([1, 2, 3, 4, 5])
    }));
    this.appendCase("basic functionality", function (this: TestCase, c) {
        this.check(UArray.eq(c.array1, c.array1) && !UArray.eq(c.array1, c.array3));
    });
    this.appendCase("consider empty values as the same.", function (this: TestCase, c) {
        this.check(UArray.eq(null, undefined));
    });
    this.appendCase("has type compatibility to AlmostArray.", function (this: TestCase, c) {
        this.check(UArray.eq(c.aa, c.aa));
    });
    this.appendCase("sort flag works as default.", function (this: TestCase, c) {
        this.check(UArray.eq(c.array1, c.array2));
    });
    this.appendCase("useStrictEqual option works.", function (this: TestCase, c) {
        this.check(UArray.eq(c.array1, ["1", "2", "3"], { useStrictEqual: false }));
    });
    this.appendCase("useStrictEqual option works with AlmostArray.", function (this: TestCase, c) {
        this.check(UArray.eq(c.aa, [1, 2, 3, 4, 5], { useStrictEqual: false }));
    });
    this.appendCase("sort option works as false.", function (this: TestCase, c) {
        this.check(!UArray.eq(c.array1, c.array2, { sort: false }));
    });
});
mt.appendUnit("randomPick", function (this: TestUnit<{
    array: number[],
    before: number
}>) {
    this.chainContextGen(_ => ({ array: int2array(10) }));
    this.chainContextGen(c => ({ before: c.array.length }));
    this.appendCase("takeout option works as false.", function (this: TestCase, c) {
        UArray.randomPick(c.array, false);
        this.check(c.array.length === c.before);
    });
    this.appendCase("picked element is removed from an array.", function (this: TestCase, c) {
        UArray.randomPick(c.array);
        this.check(c.array.length < c.before);
    });
    this.appendCase("check randomization.", function (this: TestCase, c) {
        const manyTimes = int2array(100).map(_ => UArray.randomPick(c.array, false));
        this.check(UArray.distinct(manyTimes).length > 1);
    });
});
mt.appendUnit("shuffle", function (this: TestUnit<{
    array: number[],
    ret: number[]
}>) {
    this.chainContextGen(_ => ({ array: int2array(10000) }));
    this.chainContextGen(c => ({ ret: UArray.shuffle(c.array) }));
    this.appendCase("elements is not mutated.", function (this: TestCase, c) {
        this.check(UArray.eq(c.array, int2array(c.array.length), { sort: false }))
    });
    this.appendCase("basic functionality", function (this: TestCase, c) {
        this.check(!UArray.eq(c.ret, c.array, { sort: false }));
    });
});
mt.appendUnit("chop", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const actual = UArray.chop([1, 2, 3, 4, 5], 2);
        this.check(actual.toString() === [[1, 2], [3, 4], [5]].toString());
    });
    this.appendCase("has type compatibility to AlmostArray.", function (this: TestCase) {
        const actual = Array.from(UArray.chop(new Uint8Array([1, 2, 3, 4, 5]), 2).values());
        const expected = [new Uint8Array([1, 2]), new Uint8Array([3, 4]), new Uint8Array([5])];
        this.check(actual.toString() === expected.toString());
    });
});
export const T_UArray = mt;
