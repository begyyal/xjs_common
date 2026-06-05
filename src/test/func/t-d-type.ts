import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { DType } from "../../func/decorator/d-type";
import { UArray } from "../../func/u-array";
import { CLS_B, CLS_X } from "../sample/obj/class-common";

const mt = new ModuleTest("T_DType");
mt.appendUnit("keys", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        this.check(UArray.eq(DType.keys(CLS_B), ["id", "d", "e", "cls_b", "x"]));
    });
    this.appendCase("receive non decorated class. ", function (this: TestCase) {
        this.check(UArray.eq(DType.keys(CLS_X), []));
    });
});
export const T_DType = mt;
