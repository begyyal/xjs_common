
export class TestCase<C = any> {
    private errorExpected = false;
    constructor(
        readonly moduleName: string,
        readonly name: string,
        private readonly _title: string,
        private readonly _case: (this: TestCase, context: C) => void | Promise<void>,
        private readonly _cg: () => C,
        readonly op?: { concurrent?: boolean }) { }
    expectError(): void {
        this.errorExpected = true;
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
        else if (!err && this.errorExpected)
            throw Error(`[${this.moduleName}.${this.name}] "${this._title}" didn't throw error but expected to.`);
    }
}