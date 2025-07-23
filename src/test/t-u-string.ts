import { TimeUnit } from "../const/time-unit";
import { UString } from "../func/u-string";

function test_timeFormatValidations(): void {
    if (!UString.is_yyyyMMddhhmmss("20251231235959"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhhmmss("20251231246060"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMddhhmm("202512312359"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhhmm("202512312460"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMddhh("2025123123"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhh("2025123124"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMdd("20251231"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMdd("20251200"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMM("202512"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMM("202500"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyy("2025"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyy("0025"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
}
function test_simpleTime(): void {
    const sec = UString.simpleTime();
    if (!UString.is_yyyyMMddhhmmss(sec))
        throw Error(`[UString.simpleTime()] result string's format was incorrectly. ${sec}`);
    const year = UString.simpleTime({ unit: TimeUnit.Year });
    if (!UString.is_yyyy(year))
        throw Error(`[UString.simpleTime()] returned inconsistent string with year time unit. ${year}`);
}
function test_asUsd(): void {
    let actual = null;
    if ((actual = UString.asUsd(1000000)) !== "$1,000,000")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asUsd(11.111)) !== "$11.11")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asUsd(0)) !== "$0" || (actual = UString.asUsd(null)) !== "")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
}
function test_asJpy(): void {
    let actual = null;
    if ((actual = UString.asJpy(1000000)) !== "¥1,000,000")
        throw Error(`[UString.asJpy()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asJpy(11.111)) !== "¥11")
        throw Error(`[UString.asJpy()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asJpy(0)) !== "¥0" || (actual = UString.asJpy(null)) !== "")
        throw Error(`[UString.asJpy()] number value was not formatted incorrectly. actual => ${actual}`);
}
function test_asPercentage(): void {
    let actual = null;
    if ((actual = UString.asPercentage(1)) !== "100%")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asPercentage(0.12345)) !== "12.35%")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
    if ((actual = UString.asPercentage(0)) !== "0%" || (actual = UString.asPercentage(null)) !== "")
        throw Error(`[UString.asUsd()] number value was not formatted incorrectly. actual => ${actual}`);
}
function test_repeat(): void {
    let actual = null, expected = null;
    if ((actual = UString.repeat("ab", 3)) !== (expected = "ababab"))
        throw Error(`[UString.repeat()] the actual value was inconsistent with the expected. expected => ${expected} / actual => ${actual}`);
}

export function T_UString(): void {
    test_timeFormatValidations();
    test_simpleTime();
    test_asUsd();
    test_asJpy();
    test_asPercentage();
    test_repeat();
    console.log("tests in T_UString completed.");
}
