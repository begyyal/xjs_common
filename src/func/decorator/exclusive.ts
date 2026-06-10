import { TimeUnit } from "../../const/time-unit";
import { XjsErr } from "../../obj/xjs-err";
import { toMsec, waitFor } from "../u";

const s_errCode = 100;

/**
 * makes the method exclusive in the process. **note that the method must return a `Promise`**.
 * @param op.timeoutSec default is `30`.
 * @param op.semaphore count of process to be allowed to execute the method concurrently. default is `1`.
 */
export function exclusive(op?: { timeoutSec?: number, semaphore?: number }) {
    let _smp = op?.semaphore ?? 1;
    const waitForOp = {
        timeoutMsec: toMsec(op?.timeoutSec ?? 30, TimeUnit.Sec),
        thrownIfTimeout: () => new XjsErr(s_errCode, "An exclusive process to execute was already running by other request.")
    };
    return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value!;
        async function exe(this: any, ...p: any) {
            if (_smp <= 0) await waitFor(() => _smp > 0, waitForOp);
            try {
                _smp--;
                const ret = method.apply(this, p);
                return ret instanceof Promise ? await ret : ret;
            } finally {
                _smp++;
            }
        };
        descriptor.value = exe
    };
}