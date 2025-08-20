import { MaybePromise } from "../../const/types";
import { TestCase } from "./test-case";

export class TestUnit<C = any> {
    private readonly _cases: TestCase[] = [];
    private contextGen: () => Partial<C> = () => ({});
    private initalizer: () => MaybePromise;
    private finalizer: () => MaybePromise;
    get caseCount() { return this._cases.length; }
    constructor(
        readonly moduleName: string,
        readonly name: string,
        builder: (this: TestUnit<C>) => void,
        readonly op?: { concurrent?: boolean }) {
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
    appendCase(
        title: string,
        cb: (this: TestCase<C>, c: C) => MaybePromise,
        op?: { concurrent?: boolean }): void {
        if (this._cases.some(u => u.name === title))
            throw Error("duplication of test case was detected.");
        this._cases.push(new TestCase(this.moduleName, this.name, title, cb, this.contextGen, op));
    }
    setInitializer(initalizer: () => any | Promise<any>): void {
        this.initalizer = initalizer;
    }
    setFinalizer(finalizer: () => any | Promise<any>): void {
        this.finalizer = finalizer;
    }
    async exe(): Promise<void> {
        try {
            this.initalizer?.();
            for (const tc of this._cases.filter(c => !c.op?.concurrent)) await tc.exe();
            await Promise.all(this._cases.filter(c => !!c.op?.concurrent).map(tc => tc.exe()));
        } finally { this.finalizer?.(); }
    }
}