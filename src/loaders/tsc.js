/* eslint-disable node/no-deprecated-api */

const originJsLoader = require.extensions['.ts']
const tsNode = require('ts-node')

function apply () {
    tsNode.register()
}

function restore () {
    require.extensions['.ts'] = originJsLoader
}

module.exports = { apply, restore }
