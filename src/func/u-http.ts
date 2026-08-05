
export namespace UHttp {
    export function isHttpSuccess(statusCode: number): boolean {
        return statusCategoryOf(statusCode) === 2;
    }
    export function statusCategoryOf(statusCode: number): number {
        return Math.floor(statusCode / 100);
    }
    /** normalizes object keys to lower case. */
    export function normalizeHeaders(headers?: Record<string, any>): Record<string, any> {
        if (!headers) return {};
        return Object.entries(headers).reduce((a, b) => { a[b[0].toLowerCase()] = b[1]; return a; }, {} as Record<string, any>);
    }
}