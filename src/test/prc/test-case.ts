
export class TestCase<C = any> {
    private errorExpected = false;
    private errorTest?: (e: any) => boolean;
    constructor(
        readonly moduleName: string,
        readonly name: string,
        private readonly _title: string,
        private readonly _case: (this: TestCase, context: C) => void | Promise<void>,
        private readonly _cg: () => C,
        readonly op?: { concurrent?: boolean }) { }
    expectError(test?: (e: any) => boolean): void {
        this.errorExpected = true;
        this.errorTest = test;
    }
    check(valid: boolean, additional?: () => string): void {
        if (!valid) {
            if (additional) console.error(`[${this.moduleName}.${this.name}] ${additional()}`);
            throw Error(`[${this.moduleName}.${this.name}] "${this._title}" returned false.`);
        }
    }
    async exe(): Promise<void> {
        let err = null;
        try { await this._case.bind(this)(this._cg()); }
        catch (e) { err = e; }
        if (err && !this.errorExpected) throw err;
        else if (this.errorExpected)
            if (!err) throw Error(`[${this.moduleName}.${this.name}] "${this._title}" didn't throw an error but expected to.`);
            else if (this.errorTest && !this.errorTest(err))
                throw Error(`[${this.moduleName}.${this.name}] "${this._title}" throw an error as expected but the thrown value was not expected.`);
    }
}