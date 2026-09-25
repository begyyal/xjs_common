import { Ctor, IndexSignature, MaybeArray, NormalRecord, NumericRange, RecursiveKey, Type } from "../const/types";
import { Tree, TreeRoot } from "../obj/tree";
import { DType, smbl_tm, TypeMap } from "./decorator/d-type";
import { UType } from "./u-type";

export namespace UObj {
    /**
     * assigns properties to the object with specified property keys.
     * @param t target object.
     * @param s source object.
     * @param op.keys property keys which are copied from the source object. if omit this, all keys in the source object are applied.
     * @param op.keepDtypeClass if true, classes which have properties decorated with {@link DType} in the target object are kept and it's assigned properties recursively.
     * @param op.recKeyDelim a delimiter of {@link RecursiveKey|recursive keys}. default is dot, so you have to set a value if any of the key contain dot.
     */
    export function assignProperties<
        T extends NormalRecord,
        S extends NormalRecord,
        DP extends NumericRange<0, 10> = 5,
        DL extends string = ".">(
            t: T, s: S, op?: { keys?: RecursiveKey<S, DP, NoInfer<DL>>[], keepDtypeClass?: boolean, recKeyDelim?: DL }): T & Partial<S> {
        const keepDtypeClass = !!op?.keepDtypeClass, keys = op?.keys, delim = op?.recKeyDelim ?? ".";
        if (keys?.some(k => k.includes(delim))) {
            const tree = TreeRoot.bundle(keys as string[], m => {
                const nodes = m.split(delim);
                return { node: nodes.shift()!, child: nodes.length > 0 ? nodes.join(delim) : undefined };
            });
            assignProperties4rec(t, s, tree, keepDtypeClass);
        } else for (const k of keys ?? Object.keys(s)) assignProperty(t, s, k, keepDtypeClass);
        return t;
    }
    function assignProperties4rec<T extends NormalRecord, S extends NormalRecord>(
        t: T, s: S, tree: Tree<string, string>, keepDtypeClass?: boolean): T & Partial<S> {
        for (const c of tree.branches) {
            if (c.isEnd) assignProperty(t, s, c.node, keepDtypeClass);
            else assignProperties4rec(t[c.node], s[c.node], c, keepDtypeClass);
        }
        return t;
    }
    function assignProperty<T extends NormalRecord, S extends NormalRecord>(t: T, s: S, k: keyof S, keepDtypeClass?: boolean): void {
        if (!UType.isDefined(s[k])) return;
        if (keepDtypeClass && UType.isObject(t[k]) && UType.isObject(s[k]) && t[k]?.[smbl_tm]) {
            assignProperties(t[k], s[k], { keepDtypeClass });
        } else t[k] = s[k];
    }
    /**
     * crops properties of the object other than specified. the properties are to be removed with `delete` operator.
     * @param o object whose properties to be removed.
     * @param keys property names to be remained.
     * @param op.removeKeys if true, it removes `keys` instead of remaining it.
     * @param op.recursive whether it crops properties of an object recursively. default is false.
     */
    export function crop<T extends NormalRecord>(o: T, keys: IndexSignature[], op: { removeKeys: true, recursive: true }): Partial<T>;
    export function crop<T extends NormalRecord>(o: T, keys: (keyof T)[], op?: { removeKeys?: boolean, recursive?: boolean }): Partial<T>;
    /**
     * crops properties that is not decorated with {@link DType}. the properties will be removed with `delete` operator. 
     * this treats constructual decorator such as {@link DType.object} recursively.
     * @param o object whose properties to be removed. if this is class object decorated with {@link DType}, it can omits `ctor` parameter.
     * @param ctor class constructor type whose properties are decorated with {@link DType}. **NOTE** that need to have public constructor without any parameter.
     */
    export function crop<T extends NormalRecord>(o: T, ctor?: Ctor): Partial<T>;
    export function crop<T extends NormalRecord>(o: T, keys_or_ctor?: (keyof T)[] | Ctor, op?: { removeKeys?: boolean, recursive?: boolean }): Partial<T> {
        const _removeKeys = !!op?.removeKeys;
        const tm: TypeMap = Array.isArray(keys_or_ctor) ? null
            : (!keys_or_ctor || o instanceof keys_or_ctor ? o[smbl_tm] : new keys_or_ctor()[smbl_tm]);
        const _keys = tm ? Object.keys(tm) : (keys_or_ctor as IndexSignature[] ?? []);
        if (_keys.length === 0) return _removeKeys ? o : {};
        Object.keys(o).filter(k => {
            if (tm && tm[k] && o[k]) {
                if (tm[k].cls) crop(o[k], tm[k]?.cls);
                else {
                    const vCtor = tm[k].ary?.cls ?? tm[k].rcd?.cls;
                    Object.values(o[k]).forEach(v => crop(v!, vCtor));
                }
            }
            const rm = _removeKeys === _keys.includes(k);
            if (!rm && op?.recursive && UType.isObject(o[k])) crop(o[k] as any, _keys, op);
            return rm;
        }).forEach(k => delete o[k]);
        return o;
    }
    /**
     * deletes empty (`null` or `undefined`) properties excluding propeties decorated with {@link DType.required}.
     * @param o an object to be truncated.
     * @param ctor this is referenced as a decorated schema instead of the object itself.
     */
    export function truncate<T extends NormalRecord>(o: T, ctor?: Ctor): T {
        const tm: TypeMap = (ctor ? new ctor() : o)[smbl_tm], requiredKeys = tm ? Object.keys(tm).filter(k => tm[k].req) : null;
        Object.keys(o).filter(k => UType.isEmpty(o[k]) && (!requiredKeys || !requiredKeys.includes(k))).forEach(k => delete o[k]);
        return o;
    }
    /**
     * manipulates properties of an object. 
     * as default if the properties contains object, it also manipulates properties of that recursively.
     * @param o object whose properties the process applies to.
     * @param process process to be applied to properties of the object. note that function property is not included in the properties.
     * @param op.ignoreEmpty skip null or undefined properties to manipuldate. default is true.
     * @param op.recursive whether it manipulate properties of an object recursively. default is true.
     * @param op.targetType primitive types which filter the properties to be processed.
     */
    export function manipulateProperties<T extends NormalRecord<V>, V = any>(
        o: T, process: (p: V, k: string) => any, op?: {
            ignoreEmpty?: boolean,
            recursive?: boolean,
            targetType?: MaybeArray<Type>,
        }): T {
        const target = op?.targetType && UType.takeAsArray(op?.targetType);
        const _ignoreEmpty = !UType.isDefined(op?.ignoreEmpty) || op?.ignoreEmpty;
        const _recursive = !UType.isDefined(op?.recursive) || op?.recursive;
        const rec = (_o: object) => {
            for (const k in _o) {
                const prop = (_o as any)[k];
                if (_ignoreEmpty && UType.isEmpty(prop)) continue;
                if (UType.isObject(prop) && _recursive) rec(prop);
                else if (!UType.isFunction(prop) && (!target || target.some(t => typeof prop === t)))
                    (_o as any)[k] = process(prop, k);
            }
        };
        rec(o);
        return o;
    }
    /** 
     * inverts object entries. only an object whose values can be index signature is eligible. \
     * if empty values (`null` or `undefined`) are included in the values of an original object, these entries are ignored. \
     * if symbol keys exist in an original object, also these keys are ignored.
     * @param o an object to be inverted.
     * @param op.numConv if true, numeric keys (including numeric string) are inverted to values with converting to type of number. default is false.
     */
    export function invertEntries<T extends NormalRecord<V>, V extends IndexSignature>(o: T): Record<V, `${Exclude<keyof T, symbol>}`>;
    export function invertEntries<T extends NormalRecord<V>, V extends IndexSignature>(o: T, op: { numConv: false }): Record<V, `${Exclude<keyof T, symbol>}`>;
    export function invertEntries<T extends NormalRecord<V>, V extends IndexSignature, RV = Exclude<keyof T, symbol>>(o: T, op: { numConv: true }): Record<V, RV extends `${infer N extends number}` ? N : RV>;
    export function invertEntries<T extends NormalRecord<V>, V extends IndexSignature>(o: T, op?: { numConv?: boolean }): Record<V, string | number> {
        return Object.keys(o).reduce((no, k) => {
            if (UType.isEmpty(o[k])) return no;
            if (op?.numConv) {
                const m = k.match(/^\d+(\.\d+)?$/);
                no[o[k]] = m ? Number(m[0]) : k;
            } else no[o[k]] = k;
            return no;
        }, {} as Record<V, string | number>);
    }
}