import { SanSourceFile } from './san-sourcefile'
import { extname } from 'path'
import { Component as SanComponent } from 'san'

// js ssr 还有一些缺陷，不可用来编译 ES6 或 TypeScript 编写的组件。
type GetComponentStrategy = 'ts-first' | 'js-first'

export class SanApp {
    private files: Map<string, SanSourceFile> = new Map()
    private entry: string
    private componentClass: typeof SanComponent
    private modules: Map<string, SanSourceFile> = new Map()

    constructor (entry?: string) {
        this.entry = entry
    }

    getComponentFilepath () {
        return this.entry
    }

    getComponentSourceFile (): SanSourceFile {
        return this.files.get(this.entry)
    }

    addFile (filepath: string, sourceFile: SanSourceFile) {
        const ext = extname(filepath)
        const moduleSpecifier = filepath.substr(0, filepath.length - ext.length)
        this.modules.set(moduleSpecifier, sourceFile)
        this.files.set(filepath, sourceFile)
    }

    getFile (moduleSpecifier: string) {
        if (this.files.has(moduleSpecifier)) {
            return this.files.get(moduleSpecifier)
        }
        return this.modules.get(moduleSpecifier)
    }

    * getFilepaths () {
        return this.files.keys()
    }

    * getSouceFiles () {
        return this.files.values()
    }

    getFiles (): IterableIterator<[string, SanSourceFile]> {
        return this.files.entries()
    }
}
