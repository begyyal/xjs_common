import { ModuleTest, TestCase, TestUnit } from "xjs-test";
import { TreeRoot } from "../../obj/tree";
import { UArray } from "../../func/u-array";

const mt = new ModuleTest("T_Tree");
mt.appendUnit("tree", function (this: TestUnit) {
    this.appendCase("basic functionality", async function (this: TestCase) {
        const materials = [
            "a", "b", "c", "a.a.a", "a.b", "c.d", "c.d.e", "a.a.b"
        ];
        const tree = TreeRoot.bundle(materials, m => {
            const nodes = m.split(".");
            return { node: nodes.shift()!, child: nodes.length > 0 ? nodes.join(".") : undefined };
        });
        this.check(tree.branchCount === 5, () => tree.branchCount);
        const endNodes = tree.endBranches.map(b => b.node);
        this.check(UArray.eq(endNodes, ["a", "b", "b", "b", "e"], { sort: true }), () => endNodes);
        const endMats = tree.endBranches.map(b => b.array2root.slice(1).map(b2 => b2.isBranch() ? b2.node : "").join("."));
        this.check(UArray.eq(endMats, ["a.a.a", "a.a.b", "a.b", "b", "c.d.e"], { sort: true }), () => endMats);
    });
});
export const T_Tree = mt;
