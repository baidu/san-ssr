import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { isRelativePath } from '../parsers/dependency-resolver'

export class Module {
    public filepath: string
    public content: string
    public exports = {}

    constructor (filepath: string, content: string) {
        this.filepath = filepath
        this.content = content
    }
}

type FileLoader = ((filepath: string) => string) | ({ [key:string]: string });

const defaultFileLoader = filepath => readFileSync(filepath, 'utf8')

export class CommonJS {
    private readFile
    public cache = new Map()

    constructor (readFile: FileLoader = defaultFileLoader) {
        if (typeof readFile === 'function') {
            this.readFile = readFile
        } else {
            this.readFile = filepath => readFile[filepath] || ''
        }
    }

    require (filepath: string) {
        if (!this.cache.has(filepath)) {
            const mod = new Module(filepath, this.readFile(filepath))
            // eslint-disable-next-line
            const fn = new Function('module', 'exports', 'require', mod.content)
            fn(mod, mod.exports, path => {
                if (isRelativePath(path)) {
                    path = resolve(dirname(filepath), path)
                    return this.require(path)
                }
                return require(path)
            })
            return mod.exports
        }
        return this.cache.get(filepath)
    }
}
