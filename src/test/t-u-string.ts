import { TimeUnit } from "../const/time-unit";
import { UString } from "../func/u-string";
import { ModuleTest } from "./prc/module-test";
import { TestCase } from "./prc/test-case";
import { TestUnit } from "./prc/test-unut";

const mt = new ModuleTest("T_UString");
mt.appendUnit("is_yyyyMMddhhmmss", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyyMMddhhmmss("20251231235959"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyyMMddhhmmss("20251231246060"));
    });
});
mt.appendUnit("is_yyyyMMddhhmm", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyyMMddhhmm("202512312359"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyyMMddhhmm("202512312460"));
    });
});
mt.appendUnit("is_yyyyMMddhh", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyyMMddhh("2025123123"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyyMMddhh("2025123124"));
    });
});
mt.appendUnit("is_yyyyMMdd", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyyMMdd("20251231"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyyMMdd("20251200"));
    });
});
mt.appendUnit("is_yyyyMM", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyyMM("202512"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyyMM("202500"));
    });
});
mt.appendUnit("is_yyyy", function (this: TestUnit) {
    this.appendCase("valid format", function (this: TestCase) {
        this.check(UString.is_yyyy("2025"));
    });
    this.appendCase("invalid format", function (this: TestCase) {
        this.check(!UString.is_yyyy("0025"));
    });
});
mt.appendUnit("simpleTime", function (this: TestUnit) {
    this.appendCase("default format is yyyyMMddhhmmss.", function (this: TestCase) {
        const sec = UString.simpleTime();
        this.check(UString.is_yyyyMMddhhmmss(sec), () => sec);
    });
    this.appendCase("return as a format according to a time unit option.", function (this: TestCase) {
        const year = UString.simpleTime({ unit: TimeUnit.Year });
        this.check(UString.is_yyyy(year), () => year);
    });
});
mt.appendUnit("asUsd", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const usd = UString.asUsd(1000000);
        this.check(usd === "$1,000,000", () => `actual => ${usd}`);
    });
    this.appendCase("handle decimal part.", function (this: TestCase) {
        const usd = UString.asUsd(11.111);
        this.check(usd === "$11.11", () => `actual => ${usd}`);
    });
    this.appendCase("handle zero.", function (this: TestCase) {
        const usd = UString.asUsd(0);
        this.check(usd === "$0", () => `actual => ${usd}`);
    });
    this.appendCase("handle null.", function (this: TestCase) {
        const usd = UString.asUsd(null);
        this.check(usd === "", () => `actual => ${usd}`);
    });
});
mt.appendUnit("asJpy", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const jpy = UString.asJpy(1000000);
        this.check(jpy === "¥1,000,000", () => `actual => ${jpy}`);
    });
    this.appendCase("remove decimal part.", function (this: TestCase) {
        const jpy = UString.asJpy(11.111);
        this.check(jpy === "¥11", () => `actual => ${jpy}`);
    });
    this.appendCase("handle zero.", function (this: TestCase) {
        const jpy = UString.asJpy(0);
        this.check(jpy === "¥0", () => `actual => ${jpy}`);
    });
    this.appendCase("handle null.", function (this: TestCase) {
        const jpy = UString.asJpy(null);
        this.check(jpy === "", () => `actual => ${jpy}`);
    });
});
mt.appendUnit("asPercentage", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const actual = UString.asPercentage(1);
        this.check(actual === "100%", () => `actual => ${actual}`);
    });
    this.appendCase("handle decimal part.", function (this: TestCase) {
        const actual = UString.asPercentage(0.12345);
        this.check(actual === "12.35%", () => `actual => ${actual}`);
    });
    this.appendCase("handle zero.", function (this: TestCase) {
        const actual = UString.asPercentage(0);
        this.check(actual === "0%", () => `actual => ${actual}`);
    });
    this.appendCase("handle null.", function (this: TestCase) {
        const actual = UString.asPercentage(null);
        this.check(actual === "", () => `actual => ${actual}`);
    });
});
mt.appendUnit("repeat", function (this: TestUnit) {
    this.appendCase("basic functionality", function (this: TestCase) {
        const actual = UString.repeat("ab", 3), expected = "ababab";
        this.check(actual === expected, () => `expected => ${expected} / actual => ${actual}`);
    });
});
export const T_UString = mt;
