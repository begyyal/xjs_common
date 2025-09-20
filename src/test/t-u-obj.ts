import { Type } from "../const/types";
import { UObj } from "../func/u-obj";
import { genCLS_A, genIF_A, genIF_B } from "./func/u";
import { CLS_A, CLS_B, CLS_C } from "./obj/class-common";
import { IF_A, IF_B, IF_C } from "./obj/if-common";
import { ModuleTest } from "./prc/module-test";
import { TestCase } from "./prc/test-case";
import { TestUnit } from "./prc/test-unut";

const mt = new ModuleTest("T_UObj");
mt.appendUnit("assignProperties", function (this: TestUnit<{
    record_a: IF_A,
    record_b: IF_B,
    assigned: IF_A & Partial<IF_B>
}>) {
    this.chainContextGen(_ => ({
        record_a: genIF_A(1)[0],
        record_b: genIF_B(1)[0]
    }));
    this.chainContextGen(c => ({
        assigned: UObj.assignProperties(c.record_a, c.record_b, ["b", "d"])
    }));
    this.appendCase("basic functionality", function (this: TestCase, c) {
        this.check(!!c.assigned.a && !!c.assigned.d);
    });
    this.appendCase("override property at the assigning.", function (this: TestCase, c) {
        this.check(c.assigned.b === "bbb_b");
    });
    this.appendCase("keeping d-type class optipn works.", function (this: TestCase) {
        const assign4keepOption = (keep: boolean) => {
            const b = { id: 1, a: 2, b: "3", c: { id: 11, d: [1], e: "bad" } };
            return UObj.assignProperties(genCLS_A(1)[0], b, null, keep);
        };
        this.check(!((assign4keepOption(false).c as any) instanceof CLS_B));
        this.check((assign4keepOption(true).c as any) instanceof CLS_B)
    });
});
mt.appendUnit("crop", function (this: TestUnit<{
    class_a: CLS_A,
    redundant_a: { id: number, a: number, aa: number }
}>) {
    this.chainContextGen(_ => ({ class_a: genCLS_A(1)[0] }));
    this.appendCase("basic functionality", function (this: TestCase, c) {
        const cropped = UObj.crop(c.class_a, ["id", "a", "p"]);
        this.check(Object.keys(cropped).length === 3 && !cropped.b && !cropped.c, () => JSON.stringify(cropped));
    });
    this.appendCase("exclusive mode works.", function (this: TestCase, c) {
        const cropped = UObj.crop(c.class_a, ["a", "b"], true);
        this.check(Object.keys(cropped).length === 5 && !cropped.a && !cropped.b, () => JSON.stringify(cropped));
    });
    this.appendCase("cropping based on d-type decorator works.", function (this: TestCase, c) {
        const cropped = UObj.crop(c.class_a);
        this.check(Object.keys(cropped).length === 6 && !cropped.p && !cropped.c.q, () => JSON.stringify(cropped));
    });
    this.appendCase("no error when recursive property is null.", function (this: TestCase, c) {
        c.class_a.c = null; UObj.crop(c.class_a);
    });
    this.clearContextGen();
    this.chainContextGen(_ => ({ redundant_a: { id: 1, a: 1, aa: 1 } }))
    this.appendCase("crop properties of non class object with ctor.", function (this: TestCase, c) {
        const cropped = UObj.crop(c.redundant_a, CLS_A);
        this.check(cropped.a && !cropped.aa);
    });
    this.appendCase("crop properties of non class object with ctor recursively.", function (this: TestCase, c) {
        const oc: IF_C = {
            cls: c.redundant_a,
            rcd: { a: Object.assign({}, c.redundant_a) },
            ary: [Object.assign({}, c.redundant_a)]
        };
        const cropped = UObj.crop(oc, CLS_C);
        const checkA = (oa: { a: number, aa: number }) => this.check(oa.a && !oa.aa);
        checkA(cropped.cls);
        checkA(cropped.rcd.a);
        checkA(cropped.ary[0]);
    });
});
mt.appendUnit("manipulateProperties", function (this: TestUnit<{
    class_a: CLS_A
}>) {
    this.chainContextGen(_ => ({ class_a: genCLS_A(1)[0] }));
    this.appendCase("basic functionality", function (this: TestCase, c) {
        const a = c.class_a.a, b = c.class_a.b;
        UObj.manipulateProperties(c.class_a, p => p.toString() + "test");
        this.check(c.class_a.a.toString() === a + "test" && c.class_a.b === b + "test");
    });
    this.appendCase("manipulate property recursively as default.", function (this: TestCase, c) {
        const q = c.class_a.c.q;
        UObj.manipulateProperties(c.class_a, p => p.toString() + "test");
        this.check(c.class_a.c.q === q + "test");
    });
    this.appendCase("ignoreEmpty option works.", function (this: TestCase, c) {
        this.expectError();
        UObj.manipulateProperties(c.class_a, p => p.toString(), { ignoreEmpty: false });
    });
    this.appendCase("recursive option works.", function (this: TestCase, c) {
        const q = c.class_a.c.q;
        UObj.manipulateProperties(c.class_a, p => p.toString() + "test", { recursive: false });
        this.check(c.class_a.c.q !== q + "test");
    });
    this.appendCase("targetType option works.", function (this: TestCase, c) {
        const a = c.class_a.a;
        UObj.manipulateProperties(c.class_a, p => p.toString() + "test", { targetType: Type.string });
        this.check(c.class_a.a.toString() !== a + "test");
    });
    this.appendCase("pass property key to the parameter function.", function (this: TestCase, c) {
        const a = c.class_a.a, b = c.class_a.b;
        UObj.manipulateProperties(c.class_a, (p, k) => k === "a" ? p.toString() + "test" : p);
        this.check(c.class_a.a.toString() === a + "test" && c.class_a.b === b);
    });
});
export const T_UObj = mt;
