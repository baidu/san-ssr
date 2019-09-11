/* eslint-disable node/no-deprecated-api */

const originJsLoader = require.extensions['.ts']
const tsNode = require('ts-node')

export function apply () {
    tsNode.register()
}

export function restore () {
    require.extensions['.ts'] = originJsLoader
}
