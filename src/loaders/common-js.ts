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

type FileLoader = ((filepath: string) => string) | ({ [key:string]: string });

const defaultFileLoader = filepath => readFileSync(filepath, 'utf8')

export class CommonJS {
    private readFileImpl
    private modules
    public cache = new Map()

    constructor (modules: Modules = {}, readFile: FileLoader = defaultFileLoader) {
        this.modules = modules
        if (typeof readFile === 'function') {
            this.readFileImpl = readFile
        } else {
            this.readFileImpl = filepath => readFile[filepath] || ''
        }
    }

    require (filepath: string, specifier: string = filepath) {
        debug('global require called with', filepath)
        if (!this.cache.has(filepath)) {
            debug('cache miss, reading', filepath)

            const fileContent = this.readModuleContent(filepath, specifier)
            const mod = new Module(filepath, fileContent)
            const fn = new Function('module', 'exports', 'require', mod.content) // eslint-disable-line

            fn(mod, mod.exports, path => {
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
            return mod.exports
        }
        return this.cache.get(filepath)
    }

    private readModuleContent (filepath: string, specifier: string) {
        if (this.modules[specifier] !== undefined) {
            return this.modules[specifier]
        }
        if (this.modules[filepath] !== undefined) {
            return this.modules[filepath]
        }

        const fileContent = this.readFileImpl(filepath, specifier) ||
            this.readFileImpl(filepath + '.ts') ||
            this.readFileImpl(filepath + '.js')

        if (fileContent === undefined) {
            throw new Error(`file ${filepath} not found`)
        }
        return fileContent
    }
}

export function getModuleSpecifier (filepath: string) {
    const ext = extname(filepath)
    return filepath.substr(0, filepath.length - ext.length)
}
