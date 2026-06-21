import { TimeUnit } from "../const/time-unit";
import { XjsErrCode } from "../const/xjs-err-code";
import { XjsErr } from "../obj/xjs-err";
import { int2array } from "./u";
import { UType } from "./u-type";

export namespace UString {
    export function eq(s1: string, s2: string, op?: { ignoreCace?: boolean }): boolean {
        const _ignoreCase = !!op?.ignoreCace;
        const v1 = _ignoreCase ? s1.toLowerCase() : s1, v2 = _ignoreCase ? s2.toLowerCase() : s2;
        return !UType.isString(v1) || !UType.isString(v2) ? v1 === v2 : v1.trim() === v2.trim();
    }
    export function repeat(token: string, mlt: number): string {
        return int2array(mlt).map(_ => token).join("");
    }
    export function reverse(s: string): string {
        return s.split("").reverse().join("");
    }
    /**
     * generates date time number as fixed length (depends on `unit`) string without separator character.  
     * For example, `2025-06-08T10:15:06.366Z` is to be `20250608101506366`.
     * @param op.date Date object referred by this. default is `new Date()`.
     * @param op.unit time unit. default is second.
     */
    export function simpleTime(op?: { date?: Date, unit?: TimeUnit }): string {
        const t = (op?.date ?? new Date()).toISOString().split(".")[0].replace(/[-T:]/g, "");
        if (op?.unit === TimeUnit.Msec) return t;
        return t.substring(0, 14 - (6 - (op?.unit ?? TimeUnit.Sec)) * 2);
    }
    /**
     * generates random string with specified length.
     * @param len string length to be generated.
     * @param includes.num whether numbers are included or not. default is true.
     * @param includes.alphabet whether alphbets are included or not. default is true.
     * @param includes.specials special characters excluding number and alphabet. default is none.
     */
    export function genRandomStr(
        len: number, includes?: { num?: boolean, alphabet?: boolean, specials?: string }): string;
    /**
     * generates random string with specified length.
     * @param len string length to be generated.
     * @param includes.num whether numbers are included or not. default is true.
     * @param includes.alphabet.upper whether upper case alphabets are included or not. default is true. 
     * @param includes.alphabet.lower whether lower case alphabets are included or not. default is true. 
     * @param includes.specials special characters excluding number and alphabet. default is none.
     */
    export function genRandomStr(
        len: number, includes: { num?: boolean, alphabet?: { upper?: boolean, lower?: boolean }, specials?: string }): string;
    export function genRandomStr(
        len: number,
        includes?: { num?: boolean, alphabet?: boolean | { upper?: boolean, lower?: boolean }, specials?: string }): string {
        const _includes = {
            num: includes?.num ?? true,
            alphabet: {
                upper: (UType.isBoolean(includes?.alphabet) ? includes.alphabet : includes?.alphabet?.upper) ?? true,
                lower: (UType.isBoolean(includes?.alphabet) ? includes.alphabet : includes?.alphabet?.lower) ?? true
            },
            specials: includes?.specials ?? ""
        };
        const _alphabetShift = _includes.alphabet.upper || _includes.alphabet.lower ? 52 : 0;
        const _normalLen = (_includes.num ? 12 : 0) + _alphabetShift;
        if (_normalLen + _includes.specials.length === 0)
            throw new XjsErr(XjsErrCode.UString, "no characters to include were set.");
        return int2array(len).map(_ => {
            let rnd = Math.floor((_normalLen + _includes.specials.length) * Math.random());
            if (rnd - _normalLen >= 0) return _includes.specials.at(rnd - _normalLen);
            const remain = rnd - _alphabetShift;
            if (remain >= 0) return remain.toString();
            if (rnd > 25) {
                if (_includes.alphabet.lower) rnd += 6;
                else rnd -= 26;
            } else if (!_includes.alphabet.upper) rnd += 32;
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
            throw new XjsErr(XjsErrCode.UString, "the parameter isn't az(AZ) format.");
        return az.toLowerCase().split("").map(c => c.charCodeAt(0) - 97).reverse()
            .map((idx, i) => (idx + 1) * (26 ** i)).reduce((v1, v2) => v1 + v2) - 1;
    }
    export function camel2snake(camel: string): string {
        return camel?.replaceAll(/[A-Z]/g, c => "_" + c.toLowerCase())?.replace(/^_/, "");
    }
    export function snake2camel(snake: string): string {
        return snake?.replaceAll(/_./g, c => c.charAt(1).toUpperCase());
    }
    function asAmount(amount: number, unit: string): string {
        const int2dec = Math.abs(amount).toString().split(".");
        const etni = reverse(int2dec[0]);
        let fetni = "";
        const max = Math.ceil(etni.length / 3);
        for (let i = 0; i < max; i++) {
            if (i === max - 1) fetni += etni.substring(i * 3);
            else fetni += (etni.substring(i * 3, (i + 1) * 3) + ",");
        }
        const finte = unit + reverse(fetni);
        return (amount < 0 ? "-" : "") + (int2dec.length === 1 ? finte : finte + "." + int2dec[1]);
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