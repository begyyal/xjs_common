import { Type } from "../const/types";
import { UArray } from "../func/u-array";
import { UType } from "../func/u-type";
import { CLS_A, CLS_B, CLS_C } from "./obj/class-common";
import { IF_C } from "./obj/if-common";
import { ModuleTest } from "./prc/module-test";
import { TestCase } from "./prc/test-case";
import { TestUnit } from "./prc/test-unut";

const mt = new ModuleTest("T_UType");
mt.appendUnit("isEmpty", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        this.check(UType.isEmpty(null) && UType.isEmpty(undefined) && !UType.isEmpty(0));
    });
});
mt.appendUnit("isDefined", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        this.check(!UType.isDefined(undefined) && UType.isDefined(0));
    });
});
mt.appendUnit("validate", function (this: TestUnit<{
    class_a: CLS_A,
    class_b: CLS_B
}>) {
    this.chainContextGen(_ => ({ class_a: new CLS_A() }));
    this.appendCase("required decorator works.", function (this: TestCase, c) {
        this.check(UArray.eq(UType.validate(c.class_a), ["id"]));
    });
    this.appendCase("number decorator works.", function (this: TestCase, c) {
        Object.assign(c.class_a, { id: "1" });
        this.check(UArray.eq(UType.validate(c.class_a), ["id"]));
    });
    this.chainContextGen(c => { c.class_a.id = 1; return c; })
    this.appendCase("string decorator works.", function (this: TestCase, c) {
        Object.assign(c.class_a, { b: 2 });
        this.check(UArray.eq(UType.validate(c.class_a), ["b"]));
    });
    this.chainContextGen(_ => ({ class_b: new CLS_B(2) }));
    this.appendCase("recursive decorator works.", function (this: TestCase, c) {
        Object.assign(c.class_a, { c: c.class_b });
        const actual = UType.validate(c.class_a);
        this.check(UArray.eq(actual, ["c.d", "c.e"]), () => `actual => ${actual}`);
    });
    this.appendCase("array decorator works.", function (this: TestCase, c) {
        Object.assign(c.class_b, { d: 3, e: true });
        Object.assign(c.class_a, { c: c.class_b });
        this.check(UArray.eq(UType.validate(c.class_a), ["c.d"]));
    });
    this.appendCase("check valid types in array.", function (this: TestCase, c) {
        Object.assign(c.class_b, { e: true, d: [3] });
        Object.assign(c.class_a, { c: c.class_b });
        const actual = UType.validate(c.class_a);
        this.check(actual.length === 0, () => `actual => ${actual}`);
    });
    this.appendCase("check invalid types in array.", function (this: TestCase, c) {
        Object.assign(c.class_b, { e: true, d: ["3"] });
        Object.assign(c.class_a, { c: c.class_b });
        this.check(UArray.eq(UType.validate(c.class_a), ["c.d.0"]));
    });
    this.appendCase("property decorated as array can accept empty array.", function (this: TestCase, c) {
        Object.assign(c.class_b, { e: true, d: [] });
        Object.assign(c.class_a, { c: c.class_b });
        this.check(UType.validate(c.class_a).length === 0);
    });
    this.appendCase("boolean decorator detects invalid value.", function (this: TestCase, c) {
        Object.assign(c.class_b, { e: 123, d: [] });
        Object.assign(c.class_a, { c: c.class_b });
        this.check(UArray.eq(UType.validate(c.class_a), ["c.e"]));
    });
    this.appendCase("decorators in super class works.", function (this: TestCase, c) {
        Object.assign(c.class_a, { x: "a" });
        this.check(UArray.eq(UType.validate(c.class_a), ["x"]));
    });
    this.appendCase("record decorator checks a type.", function (this: TestCase, c) {
        Object.assign(c.class_a, { record: "a" });
        this.check(UArray.eq(UType.validate(c.class_a), ["record"]));
    });
    this.appendCase("record decorator checks property types of an object.", function (this: TestCase, c) {
        Object.assign(c.class_a, { record: { a: 1, b: "bb" } });
        this.check(UArray.eq(UType.validate(c.class_a), ["record.b"]));
    });
    this.appendCase("record decorator accepts a valid object.", function (this: TestCase, c) {
        Object.assign(c.class_a, { record: { a: 1, b: 2 } });
        this.check(UType.validate(c.class_a).length === 0);
    });
    this.clearContextGen();
    this.appendCase("validate non class object with ctor.", function (this: TestCase) {
        this.check(UArray.eq(UType.validate({}, CLS_A), ["id"]));
    });
    this.appendCase("validate non class properties with ctor.", function (this: TestCase) {
        const o1: IF_C = { cls: {}, rcd: { a: {} }, ary: [{}] };
        const actual = UType.validate(o1, CLS_C);
        this.check(UArray.eq(actual, ["cls.id", "rcd.a.id", "ary.0.id"]), () => actual.toString());
        const o2: IF_C = { cls: { id: 1 }, rcd: { a: { id: 1 } }, ary: [{ id: 1 }] };
        this.check(UType.validate(o2, CLS_C).length === 0);
    });
});
mt.appendUnit("isArray", function (this: TestUnit<{
    array: (number | string)[]
}>) {
    this.chainContextGen(_ => ({ array: [1, 2, "3"] }))
    this.appendCase("basic functionality", function (this: TestCase, c) {
        this.check(UType.isArray(c.array));
    });
    this.appendCase("check invalid types.", function (this: TestCase, c) {
        this.check(!UType.isArray(c.array, Type.number));
    });
    this.appendCase("check valid types.", function (this: TestCase, c) {
        c.array.pop();
        this.check(UType.isArray(c.array, Type.number));
    });
});
export const T_UType = mt;
