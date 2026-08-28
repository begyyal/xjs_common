import { UType } from "./u-type";

export namespace UEnum {
    export function values<E extends { [k: string]: string | number }>(o: E): E[keyof E][] {
        const mappedValues = Object.values(o), numericCount = mappedValues.filter(UType.isNumber).length;
        return mappedValues.slice(numericCount) as E[keyof E][];
    }
    /**
      * this checks whether the object (**mainly enum**) has the value or not.  
      * if true this returns the value as a value type of the object.  
      * ```js
      * enum EnumA {
      *   A = "a",
      *   B = "b"
      * }
      * const enm: EnumA = valueof(EnumA, "a");
      * ```
     * @param o an object to be evaluated (like an enum).
     * @param v a value to be casted. 
     * @param op.strictEquality loose equality is taken as default, but strict equality is used if this option is true.
      */
    export function valueof<E extends { [k: string]: string | number }>(o: E, v: string | number, op?: { strictEquality?: boolean }): E[keyof E] {
        const strict = !!op?.strictEquality;
        return values(o).find(v2 => strict ? v2 === v : v2 == v) as E[keyof E];
    }
}