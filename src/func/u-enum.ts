import { UType } from "./u-type";

export namespace UEnum {
    export function values<E extends { [k: string]: string | number }>(o: E): E[keyof E][] {
        const mappedValues = Object.values(o), numericCount = mappedValues.filter(UType.isNumber).length;
        return mappedValues.slice(numericCount) as E[keyof E][];
    }
    /**
      * this checks whether the object (**mainly enum**) has the value or not.  
      * if true this returns the value as value type of the object.  
      * ```js
      * enum EnumA {
      *   A = "a",
      *   B = "b"
      * }
      * const enm: EnumA = valueof(EnumA, "a");
      * ```
      */
    export function valueof<E extends { [k: string]: string | number }>(o: E, v: string | number): E[keyof E] {
        return values(o).find(v2 => v2 === v) as E[keyof E];
    }
}