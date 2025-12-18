import { T_Array2 } from "./t-array2";
import { T_U } from "./t-u";
import { T_UArray } from "./t-u-array";
import { T_UObj } from "./t-u-obj";
import { T_UString } from "./t-u-string";
import { T_UType } from "./t-u-type";

(async () => {
    console.time("total time");
    for (const u of [
        T_U,
        T_UArray,
        T_UObj,
        T_UString,
        T_UType,
        T_Array2
    ]) await u.exe();
    console.timeEnd("total time");
})().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
