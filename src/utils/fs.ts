import { readFileSync } from 'fs'

export function readPHPSource (path: string) {
    return readFileSync(path, 'utf8').replace(/^<\?php\s*/, '')
}

export function readStringSync (path: string) {
    return readFileSync(path, 'utf8')
}
