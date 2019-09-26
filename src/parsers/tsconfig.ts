import { cwd } from 'process'
import { existsSync } from 'fs'
import { resolve } from 'path'

export function getDefaultConfigPath () {
    return resolve(cwd(), 'tsconfig.json')
}

export function getDefaultConfig () {
    const path = getDefaultConfigPath()
    return existsSync(path) ? require(path) : {}
}
