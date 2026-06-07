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
import { delay, waitFor, int2array, UHttp, retry, MaybeArray, Loggable, valueof } from "xjs-common";

(async () => {
    // await 3 seconds.
    await delay(3);
    // await a second.
    let a = false; delay(1).then(() => a = true);
    await waitFor(() => a);
    // [ 0, 1, 2, 3, 4 ]
    console.log(int2array(5));
    // runs callback with customizable retry.
    retry(async () => { }, { count: 2 });

    // utility types
    let dateCtor: Ctor = Date; // constructor type like class type.
    let maybeArray: MaybeArray<number> = 0; // also number array is applicable.
    let logger: Loggable = console; // object implements log/warn/error is applicable.

    // true
    console.log(UHttp.isHttpSuccess(204));
    // https://aaa.com?p1=a&p2=1&p2=2
    console.log(UHttp.concatParamsWithEncoding("https://aaa.com", { p1: "a", p2: ["1", "2"] }));

    enum EnumA { A = 1, B = "b", C = "3" }
    console.log(UEnum.values(EnumA)); // [1, "b", "3"]
    // checks and casts a value like enum valueof.
    const e: EnumA = UEnum.valueof(EnumA, "b");
})();
```
### [UArray](https://github.com/begyyal/xjs_common/tree/main/src/func/u-array.ts)
#### array utilities.
```ts
import { UArray } from "xjs-common";

(async () => {
    // [ 1, 3, 2, 5, 4 ]
    const ary1 = UArray.distinct([1, 3, 2, 2, 1, 5, 4]);
    console.log(ary1);
    // [1, 1, 2, 2]
    console.log(UArray.duplicate([1, 3, 2, 2, 1, 5, 4]));

    // [ 5, 4 ]
    console.log(UArray.takeOut(ary1, v => v > 3));
    // [ 1, 3, 2 ]
    console.log(ary1);

    const ary2 = [1, 2, 3];
    // true
    console.log(UArray.eq(ary1, ary2));
    // false
    console.log(UArray.eq(ary1, ary2, { sort: false }));
    // [ 1, 2 ]
    UArray.remove(ary1, 3);
    console.log(ary1);

    const ary3 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]
    console.log(UArray.chop(ary3, 3));

    // randomization.
    console.log(UArray.shuffle(ary3));
    console.log(UArray.randomPick(ary3));

    // output 6 after await 3 seconds.
    let sum = 0;
    await UArray.parallelForEach([1, 2, 3], n => delay(n).then(() => sum += n));
    console.log(sum);
    // but in this case, await about 4 seconds because count of parrallel is 2.
    await UArray.parallelForEach([1, 2, 3], n => delay(n), 2);
})();
```
### [UString](https://github.com/begyyal/xjs_common/tree/main/src/func/u-string.ts)
#### string utilities.
```ts
import { UString } from "xjs-common";

(() => {
    // false
    console.log(UString.eq("", null));
    // true
    console.log(UString.eq("tanaka taro", "  tanaka taro  "));
    // true
    console.log(UString.eq("Tanaka Taro", "tanaka taro", { ignoreCace: true }));

    // e.g. cfNouG0P
    console.log(UString.generateRandomString(8));

    // conversion between alphabet and numeric index.
    console.log(UString.az2idx("AA"));
    console.log(UString.idx2az(26));
    // conversion between camel and snake cases.
    console.log(UString.camel2snake("AaaBbb"));
    console.log(UString.snake2camel("aaa_bbb"));

    // 12.3%
    console.log(UString.asPercentage(0.123));
    // $1,000
    console.log(UString.asUsd(1000));

    // e.g. 20250615053513
    console.log(UString.simpleTime());
    // e.g. 20250615
    console.log(UString.simpleTime({ date: new Date(), unit: TimeUnit.Day }));
})();
```
### [@DType](https://github.com/begyyal/xjs_common/tree/main/src/func/decorator/d-type.ts)
#### validate, crop, and collect object properties decorated with @DType.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.  
**NOTE**: some functionalities  in this feature are based on `"useDefineForClassFields": true` in tsconfig.  
this flag is true by default at the target higher than `ES2022`, [here is for more](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields).
```ts
import { Type, DType, UType, UObj } from "xjs-common";

interface If_B { aryB: number[], boolB: boolean, q: number }
class Cls_B implements If_B {
    @DType.array({ t: Type.number })
    aryB: number[];
    @DType.boolean
    boolB: boolean;
    q: number;
    constructor() { }
}
interface If_A { id: number, strA: string, objA: If_B, p: number }
class Cls_A implements If_A {
    @DType.required
    @DType.number
    id: number;
    @DType.string
    strA: string;
    @DType.object(Cls_B)
    objA: If_B;
    p: number;
    constructor(substance?: If_A) { Object.assign(this, substance); }
}
(() => {
    // collect property keys decorated with @DType.
    console.log(DType.keys(Cls_B)); // ["aryB", "boolB"]

    const valid_b1: If_B = { aryB: [1, 2, 3], boolB: true, q: 1 };
    const valid_a1: If_A = { id: 1, strA: "a", objA: valid_b1, p: 1 };

    // remove non decorated fields.
    const cropped = UObj.crop(valid_a1, Cls_A);
    console.log(!!cropped.id && !cropped.p); // true;
    console.log(!!cropped.objA.aryB && !cropped.objA.q); // true

    // passing class object instead of ctor is allowed.
    UObj.crop(new Cls_A(valid_a1));

    // validation. below are valid cases.
    console.log(UType.validate({ id: 0 }, Cls_A)); // []
    console.log(UType.validate(valid_a1, Cls_A)); // []

    // validation. below are invalid cases.
    const invalid1 = {};
    console.log(UType.validate(invalid1, Cls_A)); // [ 'id' ]

    const invalid2 = { id: 0, strA: [], objA: valid_b1 };
    console.log(UType.validate(invalid2, Cls_A)); // [ 'strA' ]

    const invalid3 = { id: "0", strA: "a", objA: valid_b1 };
    console.log(UType.validate(invalid3, Cls_A)); // [ 'id' ]

    const invalid_b1 = { aryB: [1, 2, 3], boolB: 1 };
    const invalid4 = { id: 0, strA: "a", objA: invalid_b1 };
    console.log(UType.validate(invalid4, Cls_A)); // [ 'objA.boolB' ]

    const invalid_b2 = { aryB: ["1"], boolB: true };
    const invalid5 = { id: 0, strA: "a", objA: invalid_b2 };
    console.log(UType.validate(invalid5, Cls_A)); // [ 'objA.aryB.0' ]
})();
```
### [@exclusive](https://github.com/begyyal/xjs_common/tree/main/src/func/decorator/exclusive.ts)
#### make a method exclusive.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.  
**NOTE**: method to be decorated must returns a `Promise`.
```ts
import { exclusive, delay } from "xjs-common";

class Cls {
    constructor() { }
    // default timeout sec is 30.
    @exclusive()
    async exe1(): Promise<void> {}
    @exclusive({ timeoutSec: 3 })
    async exe2(): Promise<void> { await delay(10); }
    // it can spesifies semaphore value.
    @exclusive({ timeoutSec: 3, semaphore: 2 })
    async exe3(): Promise<void> { await delay(10); }
}
(async () => {
    const cls = new Cls();
    await Promise.all([cls.exe3(), cls.exe3()]); // here is no error because semaphore is 2.
    await Promise.all([cls.exe2(), cls.exe2()]); // get an error here!
})().catch(e => {
    // reach here after about 3 sec from second call for Cls#exe2().
    // XjsErr [Error]: [XJS] An exclusive method to execute was already running by other request.
    console.log(e);
});
```
### [Hall](https://github.com/begyyal/xjs_common/tree/main/src/obj/hall.ts)
#### facilitates data transfer across asynchronous tasks.  
```ts
import { int2array, delay, Hall } from "xjs-common";

function dispatchAsyncTask(): Hall<number> {
    const hall = new Hall<number>();
    (async () => {
        await hall.awaitAudience(); // await about 3 seconds until a audience attends.
        for (const _ of int2array(10)) {
            hall.speak(1);
            await delay(1);
        }
    })().finally(() => hall.breakUp());
    return hall;
}
(async () => {
    let sum = 0;
    const hall = dispatchAsyncTask();
    await delay(3);
    hall.assignCleaner(() => sum += 10);
    hall.attend(async n => {
        await delay(2);
        sum += n;
    });
    // await about 2*10 seconds until call breakUp() and digest all queues sequentially.
    await hall.awaitBreakingUp(); 
    console.log(sum); // 20 (1*10 + 10).
})();
```
# Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|30|`func/u-type` (include `func/decorator/d-type`) |
|40|`func/u-array` |
|100|`func/decorator/exclusive`|
|300|`obj/hall`|

# License
[Apache-License](./LICENSE)

[npm-url]: https://npmjs.org/package/xjs-common
[npm-badge]: https://badgen.net/npm/v/xjs-common
[ci-url]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml
[ci-badge]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml/badge.svg
[publish-url]: https://github.com/begyyal/xjs_commons/actions/workflows/publish.yml
[publish-badge]: https://github.com/begyyal/xjs_commons/actions/workflows/publish.yml/badge.svg
