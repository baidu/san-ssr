const { cwd } = require('process')
const { existsSync } = require('fs')
const { resolve } = require('path')

function getDefaultConfigPath () {
    return resolve(cwd(), 'tsconfig.json')
}

function getDefaultConfig () {
    const path = getDefaultConfigPath()
    return existsSync(path) ? require(path) : {}
}

module.exports = { getDefaultConfig, getDefaultConfigPath }
