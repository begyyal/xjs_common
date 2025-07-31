
export namespace UHttp {
    export function isHttpSuccess(statusCode: number): boolean {
        return statusCategoryOf(statusCode) === 2;
    }
    export function statusCategoryOf(statusCode: number): number {
        return Math.floor(statusCode / 100);
    }
    export function concatParamsWithEncoding(end: string, params: { [k: string]: string | string[] }): string {
        if (!params || Object.keys(params).length === 0) return end;
        const paramsFlatten = Object.entries(params)
            .flatMap(kv => Array.isArray(kv[1]) ? kv[1].map(v => [kv[0], v] as [string, string]) : [kv as [string, string]]);
        let result = end ? end + "?" : "";
        for (var kv of paramsFlatten)
            result += kv[0] + "=" + encodeURIComponent(kv[1]) + "&";
        return result.substring(0, result.length - 1);
    }
    /** normalize object keys to lower case. */
    export function normalizeHeaders(headers: Record<string, any>): Record<string, any> {
        if (!headers) return {};
        return Object.entries(headers).reduce((a, b) => { a[b[0].toLowerCase()] = b[1]; return a; }, {});
    }
}