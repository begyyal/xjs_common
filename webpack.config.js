
/** @type {import('webpack').Configuration} */
export default {
    mode: "production",
    entry: "./compiled/index.js",
    output: {
        filename: "index.js",
        library: 'xjs-common',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    resolve: {
        fullySpecified: false,
        extensions: [".js"]
    }
};
