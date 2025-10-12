import { XjsErr } from "../../obj/xjs-err";
import { delay } from "../u";

const s_errCode = 100;

/**
 * applies transation to the method. **note that the method must return a `Promise`**.
 * @param op.timeoutSec default is `30`.
 */
export function transaction(op?: {
    timeoutSec?: number
}) {
    let lock = 0;
    const timeoutSec = op?.timeoutSec ?? 30;
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value!;
        async function exe(this: any, ...p: any) {
            const timelimit = Date.now() + timeoutSec * 1000;
            while (lock > 0) {
                if (timelimit <= Date.now())
                    throw new XjsErr(s_errCode, "An exclusive process to execute was already running by other request.");
                await delay(1);
            }
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