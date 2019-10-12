import { cwd } from 'process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'

export function getDefaultConfigPath () {
    let dir = cwd()
    while (true) {
        const filepath = resolve(dir, 'tsconfig.json')
        if (existsSync(filepath)) return filepath
        if (dirname(dir) === dir) return
        dir = dirname(dir)
    }
}

export function getDefaultConfig () {
    const path = getDefaultConfigPath()
    return existsSync(path) ? require(path) : {}
}
