import { MaybeArray, NonObject, NormalRecord, Type } from "../const/types";
import { DType, smbl_tm, TypeMap } from "./decorator/d-type";
import { UType } from "./u-type";

export namespace UObj {
    /**
     * assign properties to the object with specified property keys.
     * @param t target object.
     * @param s source object.
     * @param keys property keys which are copied from source object. if omit this, all keys in source object is applied.
     * @param keepDtypeClass if true, class which has properties decorated with {@link DType} in target object is kept and that is assigned properties recursively.
     */
    export function assignProperties<T extends NormalRecord, S extends NormalRecord>(
        t: T, s: S, keys?: (keyof S)[], keepDtypeClass?: boolean): T & Partial<S> {
        for (const k of keys ?? Object.keys(s)) if (UType.isDefined(s[k]))
            if (keepDtypeClass && UType.isObject(t[k]) && UType.isObject(s[k]) && t[k]?.[smbl_tm]) {
                assignProperties(t[k], s[k], null, true);
            } else t[k] = s[k];
        return t;
    }
    /**
     * crop properties of the object. the properties is removed with `delete` operator.
     * @param o object whose properties is removed.
     * @param keys property names to be remained. if omit this, it removes the properties other than properties decorated {@link DType}.
     * @param exclusive if true, it removes `keys` instead of remaining it.
     */
    export function crop<T extends NormalRecord>(o: T, keys?: (keyof T)[], exclusive?: boolean): Partial<T> {
        if (!keys && !o[smbl_tm]) return {};
        const _keys = keys ?? Object.keys(o[smbl_tm]);
        Object.keys(o).filter(k => {
            if (!keys && (o[smbl_tm] as TypeMap)?.[k]?.rec && o[k]) crop(o[k]);
            return !!exclusive === _keys.includes(k);
        }).forEach(k => delete o[k]);
        return o;
    }
    /**
     * manipulate properties of an object. 
     * as default if the properties contains object, it also manipulates properties of that recursively.
     * @param o object whose properties the process applies to.
     * @param process process to be applied to properties of the object. note that function property is not included in the properties.
     * @param op.recursive whether it manipulate properties of an object recursively. default is true.
     * @param op.targetType primitive types which filter the properties to be processed.
     */
    export function manipulateProperties<T extends NormalRecord>(
        o: T, process: (v: NonObject) => NonObject, op?: {
            recursive?: boolean,
            targetType?: MaybeArray<Exclude<Type, "object" | "null" | "undefined">>,
        }): T {
        const target = op?.targetType && UType.takeAsArray(op?.targetType);
        const _recursive = !UType.isDefined(op?.recursive) || op?.recursive;
        const rec = (_o: object) => {
            for (const k in _o) {
                const prop = _o[k];
                if (UType.isObject(prop) && _recursive) rec(prop);
                else if (!UType.isFunction(prop) && (!target || target.some(t => typeof prop === t)))
                    _o[k] = process(prop);
            }
        };
        rec(o);
        return o;
    }
}