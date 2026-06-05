import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { UEnum } from "../../func/u-enum";
import { EnumA, EnumB, EnumC } from "../sample/const/enum";

const mt = new ModuleTest("T_UEnum");
mt.appendUnit("values", function (this: TestUnit) {
    this.appendCase("enumerate string values.", function (this: TestCase) {
        const values: EnumA[] = UEnum.values(EnumA);
        this.check(values.length === 3 && values[0] === EnumA.A && values[1] === EnumA.B && values[2] === EnumA.C);
    });
    this.appendCase("enumerate numeric values.", function (this: TestCase) {
        const values: EnumB[] = UEnum.values(EnumB);
        this.check(values.length === 3 && values[0] === EnumB.A && values[1] === EnumB.B && values[2] === EnumB.C);
    });
    this.appendCase("enumerate string and numeric values.", function (this: TestCase) {
        const values: EnumC[] = UEnum.values(EnumC);
        this.check(values.length === 3 && values[0] === EnumC.A && values[1] === EnumC.B && values[2] === EnumC.C);
    });
});
mt.appendUnit("valueof", function (this: TestUnit) {
    this.appendCase("cast to value from string.", function (this: TestCase) {
        const v: EnumA = UEnum.valueof(EnumA, "a");
        this.check(v === "a");
    });
    this.appendCase("cast to value from number.", function (this: TestCase) {
        const v: EnumB = UEnum.valueof(EnumB, 2);
        this.check(v === 2);
    });
    this.appendCase("exclude a value the enum doesm't contain.", function (this: TestCase) {
        this.check(UEnum.valueof(EnumA, 1) === undefined);
    });
});
export const T_UEnum = mt;
