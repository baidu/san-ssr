import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { isPath } from '../parsers/dependency-resolver'
import debugFactory from 'debug'

const debug = debugFactory('san-ssr:common-js')

export type Modules = {
    [key: string]: string
}

export class Module {
    public filepath: string
    public content: string
    public exports = {}

    constructor (filepath: string, content: string) {
        this.filepath = filepath
        this.content = content
    }
}

type FileLoader = (filepath: string) => string | undefined;

const defaultFileLoader = (filepath: string) => existsSync(filepath) ? readFileSync(filepath, 'utf8') : undefined

export class CommonJS {
    private readFileImpl: (filepath: string, specifier?: string) => string | undefined
    private modules: { [key: string]: any }
    public cache = new Map()

    constructor (modules: Modules = {}, readFile: FileLoader = defaultFileLoader) {
        debug('CommonJS created')
        this.modules = modules
        this.readFileImpl = readFile
    }

    require (filepath: string, specifier: string = filepath) {
        debug('global require called with', filepath)
        const result = this.readModuleContent(filepath, specifier)
        if (!result) return require(filepath)
        const [actualFilePath, fileContent] = result
        if (this.cache.has(actualFilePath)) return this.cache.get(actualFilePath)

        debug('cache miss, reading', filepath)
        const dir = dirname(filepath)
        const mod = new Module(filepath, fileContent)
        const fn = new Function('module', 'exports', 'require', mod.content) // eslint-disable-line

        fn(mod, mod.exports, (path: string) => {
            debug('local require called with', path)
            return this.require(
                isPath(path) ? resolve(dir, path) : path,
                path
            )
        })
        this.cache.set(actualFilePath, mod.exports)
        return this.cache.get(actualFilePath)
    }

    private readModuleContent (filepath: string, specifier: string) {
        if (this.modules[specifier] !== undefined) {
            return [specifier, this.modules[specifier]]
        }
        if (this.modules[filepath] !== undefined) {
            return [filepath, this.modules[filepath]]
        }

        let fileContent
        if ((fileContent = this.readFileImpl(filepath, specifier))) {
            return [filepath, fileContent]
        }
        if ((fileContent = this.readFileImpl(filepath + '.ts', specifier))) {
            return [filepath + '.ts', fileContent]
        }
        if ((fileContent = this.readFileImpl(filepath + '.js', specifier))) {
            return [filepath + '.js', fileContent]
        }
    }
}
