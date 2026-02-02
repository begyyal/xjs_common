
export class XjsErr extends Error {
    constructor(
        public code: number,
        public msg: string,
        public origin?: any,
    ) { super(`[XJS] ${msg}`); }
}