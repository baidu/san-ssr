/* eslint-disable node/no-deprecated-api */

let originJsLoader

export function loader (mod, filename) {
    if (originJsLoader) originJsLoader(...arguments)
    if (mod.exports) {
        if (mod.exports.default) {
            mod.exports.default.__meta = { filename }
        } else {
            mod.exports.__meta = { filename }
        }
    }
}

export function apply (ext) {
    originJsLoader = require.extensions[ext]
    require.extensions[ext] = loader
}

export function restore (ext) {
    require.extensions[ext] = originJsLoader
}
