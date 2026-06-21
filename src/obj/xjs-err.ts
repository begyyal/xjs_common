import { XjsErrCode } from "../const/xjs-err-code";

export class XjsErr extends Error {
    constructor(
        public code: XjsErrCode,
        public msg: string,
        public origin?: any,
    ) { super(`[XJS] ${msg}`); }
}