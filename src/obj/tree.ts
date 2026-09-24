import { Array2 } from "../func/array2";
import { UType } from "../func/u-type";

export interface Tree<N extends {} = any, M extends {} = any> {
    branches: TreeBranch<N, M>[];
    endBranches: TreeBranch<N, M>[];
    isRoot(): this is TreeRoot<N, M>;
    isBranch(): this is TreeBranch<N, M>;
    isEnd: boolean;
    branchCount: number;
}
abstract class TreeBase<N extends {}, M extends {}> implements Tree<N, M> {
    public readonly branches: TreeBranch<N>[];
    get endBranches(): TreeBranch<N, M>[] { return this.isEnd && !this.isRoot() ? [this] : this.branches.flatMap(c => c.endBranches); }
    get isEnd() { return this.branches.length === 0; }
    get branchCount(): number { return this.isEnd ? 1 : Array2.sum(this.branches.map(c => c.branchCount)); }
    constructor(
        materials: M[], split: (m: M) => { node: N, child?: M }) {
        this.branches = Array.from(Array2.map(materials.map(m => split(m)), t => t.node).entries())
            .filter(e => !UType.isEmpty(e[0])).map(e => new TreeBranch(this, e[0], e[1]?.map(t => t.child!)?.filter(c => c) ?? [], split));
    }
    isRoot(): this is TreeRoot<N, M> {
        return !this.isBranch();
    }
    isBranch(): this is TreeBranch<N, M> {
        return UType.isDefined((this as any)["from"]);
    }
}
export class TreeRoot<N extends {} = any, M extends {} = any> extends TreeBase<N, M> {
    private constructor(
        materials: M[], split: (m: M) => { node: N, child?: M }) {
        super(materials, split);
    }
    static bundle<N extends {} = any, M extends {} = any>(materials: M[], split: (m: M) => { node: N, child?: M }): TreeRoot<N, M> {
        return new this(materials, split);
    }
}
export class TreeBranch<N extends {} = any, M extends {} = any> extends TreeBase<N, M> {
    get array2root() {
        const cb = (t: Tree<N, M>, ary: Tree<N, M>[] = []): [TreeRoot<N, M>, ...TreeBranch<N, M>[]] => {
            ary.unshift(t);
            return t.isBranch() ? cb(t.from, ary) : ary as [TreeRoot<N, M>, ...TreeBranch<N, M>[]];
        };
        return cb(this);
    }
    constructor(
        public readonly from: Tree<N, M>,
        public readonly node: N,
        materials: M[], split: (m: M) => { node: N, child?: M }) {
        super(materials, split);
    }
}