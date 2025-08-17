import { Type } from "../../const/types";
import { XjsErr } from "../../obj/xjs-err";
import { UType } from "../u-type";
import { UObj } from "../u-obj";

const s_errCode = 30;

export const smbl_tm = Symbol.for("xjs:typeMap");
interface BasicTypeDesc { t?: Type, req?: boolean }
export interface TypeDesc extends BasicTypeDesc { ary?: TypeDesc, rec?: boolean, rcd?: TypeDesc }
type ArrayTypeDesc = TypeDesc & { t?: never, rec?: never, rcd?: never };
type ClassTypeDesc = TypeDesc & { t?: never, ary?: never, rcd?: never };
type RecordTypeDesc = TypeDesc & { t?: never, arys?: never, rec?: never };
type AnyTypeDesc = BasicTypeDesc | ArrayTypeDesc | ClassTypeDesc | RecordTypeDesc;
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
    export function array(elmDesc: AnyTypeDesc = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey, (td) => td.ary = elmDesc);
    }
    /** NOTE: this may allow array type because array is essentialy object type has properties. */
    export function record(elmDesc: AnyTypeDesc = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey, (td) => td.rcd = elmDesc);
    }
    export function recursive(target: Object, propKey: string): void {
        setDesc(target, propKey, (td) => td.rec = true);
    }
    export function keep(target: Object, propKey: string): void {
        setDesc(target, propKey, (_) => { });
    }
    function setDesc(target: Object, propKey: string, setter: (td: TypeDesc) => void): void {
        const map: TypeMap = target[smbl_tm] ? Object.assign({}, target[smbl_tm]) : {};
        map[propKey] ??= { t: null, req: false, rec: false, ary: null, rcd: null };
        const td = map[propKey];
        setter(td);
        const structualDescs = [[td.ary, "array"], [td.rec, "recursive flag"], [td.rcd, "record"]].filter(e => e[0]);
        if (structualDescs.length > 0) {
            let ex1 = null, ex2 = null;
            if (td.t) { ex1 = "type"; ex2 = structualDescs[0][1]; }
            if (structualDescs.length > 1) { ex1 = structualDescs[0][1]; ex2 = structualDescs[1][1]; }
            if (ex1 && ex2) throw new XjsErr(s_errCode, `decorator to express ${ex1} and ${ex2} are exclusive.`);
        }
        Object.defineProperty(target, smbl_tm, { value: map, configurable: true });
    }
}
