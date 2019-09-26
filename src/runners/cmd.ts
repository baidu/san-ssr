import { readFileSync } from 'fs'

export class Module {
    private filepath: string
    private content: string
    public exports = {}

    constructor (filepath: string, content?: string) {
        if (content === undefined) {
            content = readFileSync(filepath, 'utf8')
        }
        this.filepath = filepath
        this.content = content
    }

    static require (filepath: string, content?: string) {
        if (!Module.cache.has(filepath)) {
            const mod = new Module(filepath, content)
            Module.cache.set(filepath, Module.load(mod))
        }
        return Module.cache.get(filepath)
    }

    static load (mod: Module) {
        const fn = new Function('module', 'exports', 'require', mod.content) // eslint-disable-line
        fn(mod, mod.exports, require)
        return mod.exports
    }

    static cache = new Map()
}
