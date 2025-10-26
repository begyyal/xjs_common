import { Ctor, IndexSignature, MaybeArray, NonObject, NormalRecord, Type } from "../const/types";
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
     * crop properties of the object other than specified. the properties are to be removed with `delete` operator.
     * @param o object whose properties to be removed.
     * @param keys property names to be remained.
     * @param removeKeys if true, it removes `keys` instead of remaining it.
     */
    export function crop<T extends NormalRecord>(o: T, keys: (keyof T)[], removeKeys?: boolean): Partial<T>;
    /**
     * crop properties that is not decorated with {@link DType}. the properties will be removed with `delete` operator. 
     * this treats constructual decorator such as {@link DType.object} recursively.
     * @param o object whose properties to be removed. if this is class object decorated with {@link DType}, it can omits `ctor` parameter.
     * @param ctor class constructor type whose properties are decorated with {@link DType}. **NOTE** that need to have public constructor without any parameter.
     */
    export function crop<T extends NormalRecord>(o: T, ctor?: Ctor): Partial<T>;
    export function crop<T extends NormalRecord>(o: T, keys_or_ctor?: (keyof T)[] | Ctor, removeKeys?: boolean): Partial<T> {
        const tm: TypeMap = Array.isArray(keys_or_ctor) ? null
            : (!keys_or_ctor || o instanceof keys_or_ctor ? o[smbl_tm] : new keys_or_ctor()[smbl_tm]);
        const _keys = tm ? Object.keys(tm) : (keys_or_ctor as IndexSignature[] ?? []);
        if (_keys.length === 0) return removeKeys ? o : {};
        Object.keys(o).filter(k => {
            if (tm && tm[k] && o[k]) {
                if (tm[k].cls) crop(o[k], tm[k]?.cls);
                else {
                    const vCtor = tm[k].ary?.cls ?? tm[k].rcd?.cls;
                    Object.values(o[k]).forEach(v => crop(v, vCtor));
                }
            }
            return !!removeKeys === _keys.includes(k);
        }).forEach(k => delete o[k]);
        return o;
    }
    /**
     * manipulate properties of an object. 
     * as default if the properties contains object, it also manipulates properties of that recursively.
     * @param o object whose properties the process applies to.
     * @param process process to be applied to properties of the object. note that function property is not included in the properties.
     * @param op.ignoreEmpty skip null or undefined properties to manipuldate. default is true.
     * @param op.recursive whether it manipulate properties of an object recursively. default is true.
     * @param op.targetType primitive types which filter the properties to be processed.
     */
    export function manipulateProperties<T extends NormalRecord>(
        o: T, process: (p: NonObject, k: string) => NonObject, op?: {
            ignoreEmpty?: boolean,
            recursive?: boolean,
            targetType?: MaybeArray<Exclude<Type, "object" | "null" | "undefined">>,
        }): T {
        const target = op?.targetType && UType.takeAsArray(op?.targetType);
        const _ignoreEmpty = !UType.isDefined(op?.ignoreEmpty) || op?.ignoreEmpty;
        const _recursive = !UType.isDefined(op?.recursive) || op?.recursive;
        const rec = (_o: object) => {
            for (const k in _o) {
                const prop = _o[k];
                if (_ignoreEmpty && UType.isEmpty(prop)) continue;
                if (UType.isObject(prop) && _recursive) rec(prop);
                else if (!UType.isFunction(prop) && (!target || target.some(t => typeof prop === t)))
                    _o[k] = process(prop, k);
            }
        };
        rec(o);
        return o;
    }
    /**
     * generate a record object which contains spedified keys with values generated from value generator.
     * @param keys keys contained in the object.
     * @param vgen value generator.
     */
    export function generateRecord<K extends IndexSignature, V>(keys: K[], vgen: (k: K) => V): Record<K, V> {
        return keys.reduce((o, k) => { o[k] = vgen(k); return o; }, {} as Record<K, V>);
    }
}