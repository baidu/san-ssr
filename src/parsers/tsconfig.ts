import { cwd } from 'process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'

export function getDefaultTSConfigPath (dir = cwd()) {
    while (true) {
        const filepath = resolve(dir, 'tsconfig.json')
        if (existsSync(filepath)) return filepath
        if (dirname(dir) === dir) return
        dir = dirname(dir)
    }
}
