import { Type } from "../../const/types";
import { DType } from "../../func/decorator/d-type";
import { IF_C } from "./if-common";

export abstract class CLS_Base {
    @DType.number
    x: number;
    constructor() { }
}
export class CLS_B extends CLS_Base {
    @DType.required
    @DType.number
    id: number;
    @DType.required
    @DType.array({ t: Type.number })
    d: number[];
    @DType.required
    @DType.boolean
    e: boolean;
    q: any;
    constructor(
        id?: number,
        d?: number[],
        e?: boolean,
        q?: any
    ) {
        super();
        this.id = id;
        this.d = d;
        this.e = e;
        this.q = q;
    }
}
export class CLS_A extends CLS_Base {
    @DType.required
    @DType.number
    id: number;
    @DType.number
    a: number;
    @DType.string
    b: string;
    @DType.recursive(CLS_B)
    c: CLS_B;
    p: any;
    @DType.record({ t: Type.number })
    record: any;
    constructor(
        id?: number,
        a?: number,
        b?: string,
        c?: CLS_B,
        p?: any) {
        super();
        this.id = id;
        this.a = a;
        this.b = b;
        this.c = c;
        this.p = p;
    }
}
export class CLS_C extends CLS_Base implements IF_C {
    @DType.recursive(CLS_A)
    cls: any;
    @DType.record(CLS_A)
    rcd: Record<string, any>;
    @DType.array(CLS_A)
    ary: any[];
    constructor(
        cls?: any,
        rcd?: any,
        ary?: any) {
        super();
        this.cls = cls;
        this.rcd = rcd;
        this.ary = ary;
    }
}