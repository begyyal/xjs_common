import { T_Exclusive } from "./func/decorator/t-exclusive";
import { T_Array2 } from "./func/t-array2";
import { T_DType } from "./func/decorator/t-d-type";
import { T_U } from "./func/t-u";
import { T_UArray } from "./func/t-u-array";
import { T_UEnum } from "./func/t-u-enum";
import { T_UObj } from "./func/t-u-obj";
import { T_UString } from "./func/t-u-string";
import { T_UType } from "./func/t-u-type";
import { T_Hall } from "./obj/t-hall";

(async () => {
    console.time("total time");
    await Promise.all([
        T_Exclusive,
        T_Hall,
        T_U,
        T_UArray,
        T_UObj,
        T_UString,
        T_UType,
        T_UEnum,
        T_Array2,
        T_DType
    ].map(u => u.exe()));
    console.timeEnd("total time");
})().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
