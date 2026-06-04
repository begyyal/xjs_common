import { int2array } from "../../../func/u";
import { CLS_A, CLS_B } from "../obj/class-common";
import { IF_A, IF_B } from "../obj/if-common";

export function genIF_A(len: number): IF_A[] {
    return int2array(len).map(i => ({ id: i, a: "aaa", b: "bbb", c: "ccc", d: "ddd" }));
}
export function genIF_B(len: number): IF_B[] {
    return int2array(len).map(i => ({ id: i, b: "bbb_b", c: "ccc_b", d: i + len }));
}
export function genCLS_A(len: number): CLS_A[] {
    return int2array(len).map(i => new CLS_A(i, i * 2, "bbb", genCLS_B(1)[0], "ppp"));
}
export function genCLS_B(len: number): CLS_B[] {
    return int2array(len).map(i => new CLS_B(i, [i, i + 1], true, "qqq"));
}
