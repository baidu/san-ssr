import { readFileSync } from 'fs'
import { extname, dirname, resolve } from 'path'
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
            const fileContent = this.readFile(filepath) ||
                this.readFile(filepath + '.ts') ||
                this.readFile(filepath + '.js')
            if (!fileContent) throw new Error(`file ${filepath} not found`)

            const mod = new Module(filepath, fileContent)
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

export function getModuleSpecifier (filepath: string) {
    const ext = extname(filepath)
    return filepath.substr(0, filepath.length - ext.length)
}
