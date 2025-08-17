import { Type } from "../const/types";
import { UArray } from "../func/u-array";
import { UType } from "../func/u-type";
import { CLS_A, CLS_B } from "./obj/class-common";

function test1(): void {
    if (!UType.isEmpty(null) || !UType.isEmpty(undefined) || UType.isEmpty(0))
        throw Error("[UType.isEmpty] test1 - not working.");
    if (UType.isDefined(undefined) || !UType.isDefined(0))
        throw Error("[UType.isDefined] test1 - not working.");
}
function test_validate(): void {
    const a = new CLS_A();
    if (!UArray.eq(UType.validate(a), ["id"]))
        throw Error("[UType.validate] required decorator was not working.");
    Object.assign(a, { id: "1" });
    if (!UArray.eq(UType.validate(a), ["id"]))
        throw Error("[UType.validate] number decorator was not working.");
    Object.assign(a, { id: 1, b: 2 });
    if (!UArray.eq(UType.validate(a), ["b"]))
        throw Error("[UType.validate] string decorator was not working.");
    const b = new CLS_B();
    Object.assign(a, { b: "2", c: b });
    if (!UArray.eq(UType.validate(a), ["c.id", "c.d", "c.e"]))
        throw Error("[UType.validate] recursive decorator was not working.");
    Object.assign(b, { id: 2, d: 3, e: true });
    Object.assign(a, { c: b });
    if (!UArray.eq(UType.validate(a), ["c.d"]))
        throw Error("[UType.validate] array decorator was not working. [0]");
    Object.assign(b, { d: ["3"] });
    Object.assign(a, { c: b });
    if (!UArray.eq(UType.validate(a), ["c.d.0"]))
        throw Error("[UType.validate] array decorator was not working. [1]");
    Object.assign(b, { d: [] });
    Object.assign(a, { c: b });
    if (UType.validate(a).length !== 0)
        throw Error("[UType.validate] array decorator was not working. [2]");
    Object.assign(b, { d: [3] });
    Object.assign(a, { c: b });
    if (UType.validate(a).length !== 0)
        throw Error("[UType.validate] array decorator was not working. [3]");
    Object.assign(b, { e: 123 });
    Object.assign(a, { c: b });
    if (!UArray.eq(UType.validate(a), ["c.e"]))
        throw Error("[UType.validate] boolean decorator was not working.");
    Object.assign(b, { e: false });
    Object.assign(a, { c: b });
    if (UType.validate(a).length !== 0)
        throw Error("[UType.validate] something went wrong.");
    Object.assign(a, { x: "a" });
    if (!UArray.eq(UType.validate(a), ["x"]))
        throw Error("[UType.validate] decorator in super class was ignored.");
}
function test_isArray(): void {
    const a = [1, 2, "3"];
    if (!UType.isArray(a)) throw Error("[UType.isArray] not working.");
    if (UType.isArray(a, Type.number)) throw Error("[UType.isArray] type check is not working.");
    a.pop();
    if (!UType.isArray(a, Type.number)) throw Error("[UType.isArray] type check is not working.");
}

export function T_UType(): void {
    test1();
    test_validate();
    test_isArray();
    console.log("tests in T_UType completed.");
}
