import { Ctor, Type } from "../../const/types";
import { XjsErr } from "../../obj/xjs-err";
import { UType } from "../u-type";
import { UObj } from "../u-obj";

const s_errCode = 30;

export const smbl_tm = Symbol.for("xjs:typeMap");
export interface TypeDesc { t?: Type, req?: boolean, ary?: TypeDesc, rcd?: TypeDesc, obj?: Ctor }
export interface TypeMap { [k: string]: TypeDesc }
/** 
 * decorators to be validated by {@link UType.validate},
 * and to be cropped by {@link UObj.crop}.
 */
export namespace DType {
    export function string(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.string);
    }
    export function number(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.number);
    }
    export function boolean(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.boolean);
    }
    function setTypeDesc(target: Object, propKey: string, t: Type): void {
        setDesc(target, propKey, (td) => {
            if (td.t) throw new XjsErr(s_errCode, "decorator to express type is duplicate.");
            td.t = t;
        });
    }
    export function required(target: Object, propKey: string): void {
        setDesc(target, propKey, (td) => td.req = true);
    }
    export function array(elmDesc: TypeDesc | Ctor = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey,
            (td) => UType.isFunction(elmDesc) ? td.ary = { obj: elmDesc } : td.ary = elmDesc);
    }
    /** NOTE: this may allow array type because array is essentialy object type has properties. */
    export function record(elmDesc: TypeDesc | Ctor = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey,
            (td) => UType.isFunction(elmDesc) ? td.rcd = { obj: elmDesc } : td.rcd = elmDesc);
    }
    export function recursive(ctor: Ctor): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey, (td) => td.obj = ctor);
    }
    export function keep(target: Object, propKey: string): void {
        setDesc(target, propKey, (_) => { });
    }
    function setDesc(target: Object, propKey: string, setter: (td: TypeDesc) => void): void {
        const map: TypeMap = target[smbl_tm] ? Object.assign({}, target[smbl_tm]) : {};
        map[propKey] ??= { t: null, req: false, obj: null, ary: null, rcd: null };
        const td = map[propKey];
        setter(td);
        const structualDescs = [[td.ary, "array"], [td.obj, "recursive"], [td.rcd, "record"]].filter(e => e[0]);
        if (structualDescs.length > 0) {
            let ex1 = null, ex2 = null;
            if (td.t) { ex1 = "type"; ex2 = structualDescs[0][1]; }
            if (structualDescs.length > 1) { ex1 = structualDescs[0][1]; ex2 = structualDescs[1][1]; }
            if (ex1 && ex2) throw new XjsErr(s_errCode, `decorator to express ${ex1} and ${ex2} are exclusive.`);
        }
        Object.defineProperty(target, smbl_tm, { value: map, configurable: true });
    }
}
