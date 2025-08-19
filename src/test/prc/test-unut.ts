import { MaybePromise } from "../../const/types";
import { TestCase } from "./test-case";

export class TestUnit<C = any> {
    private readonly _cases: TestCase[] = [];
    private contextGen: () => Partial<C> = () => ({});
    get caseCount() { return this._cases.length; }
    constructor(
        readonly moduleName: string,
        readonly name: string,
        builder: (this: TestUnit<C>) => void) {
        builder.bind(this)();
    }
    chainContextGen(cb: (c: Partial<C>) => Partial<C>): void {
        const beforeGen = this.contextGen;
        this.contextGen = () => {
            const c = beforeGen();
            return Object.assign(c, cb(c));
        };
    }
    clearContextGen(): void {
        this.contextGen = () => ({});
    }
    appendCase(title: string, cb: (this: TestCase<C>, c: C) => MaybePromise): void {
        if (this._cases.some(u => u.name === title))
            throw Error("duplication of test case was detected.");
        this._cases.push(new TestCase(this.moduleName, this.name, title, cb, this.contextGen));
    }
    async exe(): Promise<void> {
        for (const tc of this._cases) await tc.exe();
    }
}