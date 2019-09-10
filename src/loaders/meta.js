/* eslint-disable node/no-deprecated-api */

let originJsLoader

function loader (module, filename) {
    if (originJsLoader) originJsLoader(...arguments)
    if (module.exports) {
        if (module.exports.default) {
            module.exports.default.__meta = { filename }
        } else {
            module.exports.__meta = { filename }
        }
    }
}

function apply (ext) {
    originJsLoader = require.extensions[ext]
    require.extensions[ext] = loader
}

function restore (ext) {
    require.extensions[ext] = originJsLoader
}

module.exports = { apply, restore }
