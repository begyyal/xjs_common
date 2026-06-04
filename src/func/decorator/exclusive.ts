import { TimeUnit } from "../../const/time-unit";
import { XjsErr } from "../../obj/xjs-err";
import { toMsec, waitFor } from "../u";

const s_errCode = 100;

/**
 * make the method exclusive in the process. **note that the method must return a `Promise`**.
 * @param op.timeoutSec default is `30`.
 */
export function exclusive(op?: {
    timeoutSec?: number
}) {
    let lock = 0;
    const waitForOp = {
        timeoutMsec: toMsec(op?.timeoutSec ?? 30, TimeUnit.Sec),
        thrownIfTimeout: () => new XjsErr(s_errCode, "An exclusive process to execute was already running by other request.")
    };
    return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value!;
        async function exe(this: any, ...p: any) {
            if (lock > 0) await waitFor(() => lock <= 0, waitForOp);
            try {
                lock++;
                const ret = method.apply(this, p);
                return ret instanceof Promise ? await ret : ret;
            } finally {
                lock--;
            }
        };
        descriptor.value = exe
    };
}