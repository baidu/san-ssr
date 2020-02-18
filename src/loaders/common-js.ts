import { readFileSync } from 'fs'
import { extname, dirname, resolve } from 'path'
import { isRelativePath } from '../parsers/dependency-resolver'
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

type FileLoader = ((filepath: string) => string | undefined) | ({ [key:string]: string });

const defaultFileLoader = (filepath: string) => readFileSync(filepath, 'utf8')

export class CommonJS {
    private readFileImpl: (filepath: string, specifier?: string) => string | undefined
    private modules: { [key: string]: any }
    public cache = new Map()

    constructor (modules: Modules = {}, readFile: FileLoader = defaultFileLoader) {
        debug('CommonJS created')
        this.modules = modules
        if (typeof readFile === 'function') {
            this.readFileImpl = readFile
        } else {
            this.readFileImpl = filepath => readFile[filepath] || ''
        }
    }

    require (filepath: string, specifier: string = filepath) {
        debug('global require called with', filepath)
        const [actualFilePath, fileContent] = this.readModuleContent(filepath, specifier)
        if (!this.cache.has(actualFilePath)) {
            debug('cache miss, reading', filepath)
            const mod = new Module(filepath, fileContent)
            const fn = new Function('module', 'exports', 'require', mod.content) // eslint-disable-line

            fn(mod, mod.exports, (path: string) => {
                debug('local require called with', path)
                if (isRelativePath(path)) {
                    return this.require(resolve(dirname(filepath), path), path)
                }

                // 兼容配置的模块名为 绝对路径或 node module 模块名
                if (this.modules[path] !== undefined) {
                    return this.require(path)
                }

                return require(path)
            })
            this.cache.set(actualFilePath, mod.exports)
        }
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
        throw new Error(`file ${filepath} not found`)
    }
}

export function getModuleSpecifier (filepath: string) {
    const ext = extname(filepath)
    return filepath.substr(0, filepath.length - ext.length)
}
