[![npm][npm-badge]][npm-url] [![CI][ci-badge]][ci-url] [![publish][publish-badge]][publish-url]

# Overview
Library modules for typescript that bundled general-purpose implementations.  
This module is very simple, therefore it has no dependencies.

# Install
```
npm i xjs-common
```
**NOTE**: features related nodejs was moved to [xjs-node](https://github.com/begyyal/xjs_node) at v10.0.0.  
if you has been used the features (e.g. `HttpResolver`, `UFile`), please use the new package instead of this.

# Code example (only part)
### Miscellaneous utilities.
```ts
import { delay, int2array, UHttp, retry, MaybeArray, Loggable } from "xjs-common";

(async () => {
    // await 3 seconds.
    await delay(3);

    // [ 0, 1, 2, 3, 4 ]
    console.log(int2array(5));

    // runs callback with customizable retry.
    retry(async () => { }, { count: 2 });

    // utility types
    let maybeArray: MaybeArray<number> = 0; // also number array is applicable.
    let logger: Loggable = console; // object implements log/warn/error is applicable.

    // true
    console.log(UHttp.isHttpSuccess(204));

    // https://aaa.com?p1=a&p2=1&p2=2
    console.log(UHttp.concatParamsWithEncoding("https://aaa.com", { p1: "a", p2: ["1", "2"] }));
    // p1=a&p2=1&p2=2
    console.log(UHttp.concatParamsWithEncoding(null, { p1: "a", p2: ["1", "2"] }));
})();
```
### Array utilities.
```ts
import { UArray } from "xjs-common";

(() => {
    // [ 1, 3, 2, 5, 4 ]
    const ary1 = UArray.distinct([1, 3, 2, 2, 1, 5, 4]);
    console.log(ary1);

    // [ 5, 4 ]
    console.log(UArray.takeOut(ary1, v => v > 3));
    // [ 1, 3, 2 ]
    console.log(ary1);

    const ary2 = [1, 2, 3];
    // true
    console.log(UArray.eq(ary1, ary2));
    // false
    console.log(UArray.eq(ary1, ary2, { sort: false }));

    const ary3 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]
    console.log(UArray.chop(ary3, 3));

    // randomization.
    console.log(UArray.shuffle(ary3));
    console.log(UArray.randomPick(ary3));
})();
```
### String utilities.
```ts
import { UString } from "xjs-common";

(() => {
    // false
    console.log(UString.eq("", null));
    // true
    console.log(UString.eq("tanaka taro", "  tanaka taro  "));

    // e.g. cfNouG0P
    console.log(UString.generateRandomString(8));

    // 26
    console.log(UString.az2idx("AA"));
    // AA
    console.log(UString.idx2az(26));

    // e.g. 20250615053513
    console.log(UString.simpleTime());
    // e.g. 20250615
    console.log(UString.simpleTime({ date: getJSTDate(), unit: TimeUnit.Day }));
})();
```
### Mark method as transaction.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.
```ts
import { transaction, delay } from "xjs-common";

class Cls {
    constructor() { }
    // default timeout sec is 30.
    @transaction()
    async exe1(): Promise<void> {
    }
    @transaction({ timeoutSec: 3 })
    async exe2(): Promise<void> {
        await delay(10);
    }
}
(async () => {
    const cls = new Cls();
    await Promise.all([cls.exe2(), cls.exe2()]);
})().catch(e => {
    // reach here after 3 sec from second call for Cls#exe2().
    // XjsErr [Error]: [XJS] An exclusive process to execute was already running by other request.
    console.log(e);
});
```
### Validate and crop class fields.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.  
**NOTE**: some functionalities  in this feature are based on `"useDefineForClassFields": true` in tsconfig.  
this flag is true by default at the target higher than `ES2022`, [here is for more](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields).
```ts
import { Type, DType, UType, UObj } from "xjs-common";

class Cls_A {
    @DType.required
    @DType.number
    id: number;
    @DType.string
    strA: string;
    @DType.recursive
    objA: Cls_B;
    p: number;
    constructor() { }
}
class Cls_B {
    @DType.array({ t: Type.number })
    aryB: number[];
    @DType.boolean
    boolB: boolean;
    q: number;
    constructor() { }
}
(() => {
    const valid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: true, q: 1 });
    const valid1 = Object.assign(new Cls_A(), { id: 1, strA: "a", objA: valid_b1, p: 1 });

    // remove non decorated fields.
    const cropped = UObj.crop(valid1);
    console.log(!!cropped.id && !cropped.p && !!cropped.objA.aryB && !cropped.objA.q) // true;

    // validation. below are valid cases.
    console.log(UType.validate(valid1)); // []

    const valid2 = { id: 0 };
    console.log(UType.validate(Object.assign(new Cls_A(), valid2))); // []

    // validation. below are invalid cases.
    const invalid1 = {};
    console.log(UType.validate(Object.assign(new Cls_A(), invalid1))); // [ 'id' ]

    const invalid3 = { id: 0, strA: [], objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid3))); // [ 'strA' ]

    const invalid4 = { id: "0", strA: "a", objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid4))); // [ 'id' ]

    const invalid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: 1 });
    const invalid5 = { id: 0, strA: "a", objA: invalid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid5))); // [ 'objA.boolB' ]

    const invalid_b2 = Object.assign(new Cls_B(), { aryB: ["1"], boolB: true });
    const invalid6 = { id: 0, strA: "a", objA: invalid_b2 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid6))); // [ 'objA.aryB' ]
})();
```
# Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|30|`func/u-type` (include `func/decorator/d-type`) |
|100|`func/decorator/transaction`|

# License
[Apache-License](./LICENSE)

[npm-url]: https://npmjs.org/package/xjs-common
[npm-badge]: https://badgen.net/npm/v/xjs-common
[ci-url]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml
[ci-badge]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml/badge.svg
[publish-url]: https://github.com/begyyal/xjs_commons/actions/workflows/publish.yml
[publish-badge]: https://github.com/begyyal/xjs_commons/actions/workflows/publish.yml/badge.svg
