import { readFileSync } from 'fs'

export function readStringSync (path: string) {
    return readFileSync(path, 'utf8')
}
