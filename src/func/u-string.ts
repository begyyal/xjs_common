import { TimeUnit } from "../const/time-unit";
import { XjsErr } from "../obj/xjs-err";
import { int2array } from "./u";
import { UType } from "./u-type";

const s_errCode = 20;

export namespace UString {
    export function eq(s1: string, s2: string): boolean {
        return !UType.isString(s1) || !UType.isString(s2) ? s1 === s2 : s1.trim() === s2.trim();
    }
    /**
     * generate date time number as fixed length (depends on `unit`) string without separator charactor.  
     * For example, `2025-06-08T10:15:06.366Z` is to be `20250608101506366`.
     * @param op.date Date object refered by this. default is `new Date()`.
     * @param op.unit time unit. default is secound.
     */
    export function simpleTime(op?: { date?: Date, unit?: TimeUnit }): string {
        const t = (op?.date ?? new Date()).toISOString().split(".")[0].replace(/[-T:]/g, "");
        if (op?.unit === TimeUnit.Msec) return t;
        return t.substring(0, 14 - (6 - (op?.unit ?? TimeUnit.Sec)) * 2);
    }
    export function generateRandomString(len: number): string {
        return int2array(len).map(_ => {
            let rnd = Math.floor(62 * Math.random());
            const remain = rnd - 52;
            if (remain >= 0) return remain.toString();
            if (rnd > 26) rnd += 6;
            return String.fromCharCode(rnd + 65);
        }).join("");
    }
    export function idx2az(idx: number): string {
        let az = "", num = idx;
        while (num >= 0) {
            az = String.fromCharCode(num % 26 + 97) + az;
            num = Math.floor(num / 26) - 1;
        }
        return az.toUpperCase();
    }
    export function az2idx(az: string): number {
        if (!az?.match(/^[a-zA-Z]+$/))
            throw new XjsErr(s_errCode, "the parameter isn't az(AZ) format.");
        return az.toLowerCase().split("").map(c => c.charCodeAt(0) - 97).reverse()
            .map((idx, i) => (idx + 1) * (26 ** i)).reduce((v1, v2) => v1 + v2) - 1;
    }
    function asAmount(amount: number, unit: string): string {
        const int2dec = amount.toString().split(".");
        const etni = int2dec[0].split("").reverse().join("");
        let fetni = "";
        const max = Math.ceil(etni.length / 3);
        for (let i = 0; i < max; i++) {
            if (i === max - 1) fetni += etni.substring(i * 3);
            else fetni += (etni.substring(i * 3, (i + 1) * 3) + ",");
        }
        const finte = unit + fetni.split("").reverse().join("");
        if (int2dec.length === 1) return finte;
        else return finte + "." + int2dec[1];
    }
    export function asJpy(amount: number): string {
        return UType.isEmpty(amount) ? "" : asAmount(Math.floor(amount), "¥");
    }
    export function asUsd(amount: number): string {
        return UType.isEmpty(amount) ? "" : asAmount(Number(amount.toFixed(2)), "$");
    }
    export function asPercentage(amount: number): string {
        if (UType.isEmpty(amount)) return "";
        let percent = (amount * 100).toFixed(2);
        while (percent.endsWith("0")) percent = percent.substring(0, percent.length - 1);
        if (percent.endsWith(".")) percent = percent.substring(0, percent.length - 1);
        return percent + "%";
    }
    export function is_yyyy(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}$/);
    }
    export function is_yyyyMM(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}(0[1-9]|1[0-2])$/);
    }
    export function is_yyyyMMdd(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|[3][0-1])$/);
    }
    export function is_yyyyMMddhh(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|[3][0-1])([01]\d|2[0-3])$/);
    }
    export function is_yyyyMMddhhmm(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|[3][0-1])([01]\d|2[0-3])[0-5]\d$/);
    }
    export function is_yyyyMMddhhmmss(v: string): boolean {
        return !!v?.match(/^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|[3][0-1])([01]\d|2[0-3])[0-5]\d[0-5]\d$/);
    }
}