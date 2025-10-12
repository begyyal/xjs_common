import { Ctor, Type } from "../../const/types";
import { XjsErr } from "../../obj/xjs-err";
import { UType } from "../u-type";
import { UObj } from "../u-obj";

const s_errCode = 30;

export const smbl_tm = Symbol.for("xjs:typeMap");
export interface TypeDesc {
    /** express primitive type or `object` listed in {@link Type}. */
    t?: Type;
    /** express required. */
    req?: boolean;
    /** type description of each value in an array. */
    ary?: TypeDesc;
    /** express class of the property decorated with {@link DType}. */
    cls?: Ctor;
    /** type description of each value in a record object. */
    rcd?: TypeDesc;
}
type BasicTypeDesc = TypeDesc & { ary?: never, obj?: never, rec?: never, rcd?: never };
type ArrayTypeDesc = TypeDesc & { t?: never, obj?: never, rec?: never, rcd?: never };
type ClassTypeDesc = TypeDesc & { t?: never, ary?: never, rec?: never, rcd?: never };
type RecordTypeDesc = TypeDesc & { t?: never, arys?: never, obj?: never, rec?: never };
type AnyTypeDesc = BasicTypeDesc | ArrayTypeDesc | ClassTypeDesc | RecordTypeDesc;
export interface TypeMap { [k: string]: TypeDesc }
/** 
 * decorators to be validated by {@link UType.validate},
 * and to be cropped by {@link UObj.crop}.
 */
export namespace DType {
    /** express `string` property. */
    export function string(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.string);
    }
    /** express `number` property. */
    export function number(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.number);
    }
    /** express `boolean` property. */
    export function boolean(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.boolean);
    }
    function setTypeDesc(target: Object, propKey: string, t: Type): void {
        setDesc(target, propKey, (td) => {
            if (td.t) throw new XjsErr(s_errCode, "decorator to express type is duplicate.");
            td.t = t;
        });
    }
    /** express required property. */
    export function required(target: Object, propKey: string): void {
        setDesc(target, propKey, (td) => td.req = true);
    }
    /**
     * express array.
     * @param elmDesc {@link TypeDesc} or {@link Ctor|class constructor type}.
     */
    export function array(elmDesc: AnyTypeDesc | Ctor = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey,
            (td) => UType.isFunction(elmDesc) ? td.ary = { cls: elmDesc } : td.ary = elmDesc);
    }
    /**
     * express record object. note that this may allow array type because array is essentialy object type has properties. 
     * @param elmDesc {@link TypeDesc} or {@link Ctor|class constructor type}.
     */
    export function record(elmDesc: AnyTypeDesc | Ctor = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey,
            (td) => UType.isFunction(elmDesc) ? td.rcd = { cls: elmDesc } : td.rcd = elmDesc);
    }
    /**
     * express an object which has properties that specified class express with {@link DType}. 
     * @param ctor {@link Ctor|class constructor type}.
     */
    export function object(ctor: Ctor): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey, (td) => td.cls = ctor);
    }
    export function keep(target: Object, propKey: string): void {
        setDesc(target, propKey, (_) => { });
    }
    function setDesc(target: Object, propKey: string, setter: (td: TypeDesc) => void): void {
        const map: TypeMap = target[smbl_tm] ? Object.assign({}, target[smbl_tm]) : {};
        map[propKey] ??= { t: null, req: false, cls: null, ary: null, rcd: null };
        const td = map[propKey];
        setter(td);
        const structualDescs = [[td.ary, "array"], [td.cls, "class"], [td.rcd, "record"]].filter(e => e[0]);
        if (structualDescs.length > 0) {
            let ex1 = null, ex2 = null;
            if (td.t) { ex1 = "type"; ex2 = structualDescs[0][1]; }
            if (structualDescs.length > 1) { ex1 = structualDescs[0][1]; ex2 = structualDescs[1][1]; }
            if (ex1 && ex2) throw new XjsErr(s_errCode, `decorator to express ${ex1} and ${ex2} are exclusive.`);
        }
        Object.defineProperty(target, smbl_tm, { value: map, configurable: true });
    }
}
