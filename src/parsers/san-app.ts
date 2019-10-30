import { CommonJS } from '../loaders/common-js'
import { ts2js } from '../transpilers/ts2js'
import { SanSourceFile } from '../models/san-sourcefile'
import { extname } from 'path'

// js ssr 还有一些缺陷，不可用来编译 ES6 或 TypeScript 编写的组件。
type GetComponentStrategy = 'ts-first' | 'js-first'

enum SourceFileType {
    js = 'js',
    ts = 'ts'
}

export class SanApp {
    private files: Map<string, SanSourceFile> = new Map()
    private entry: string
    private modules: Map<string, SanSourceFile> = new Map()
    private sourceFileType: SourceFileType

    constructor (entry?: string) {
        this.entry = entry
        const ext = extname(entry)
        if (ext === '.js') this.sourceFileType = SourceFileType.js
        else if (ext === '.ts') this.sourceFileType = SourceFileType.ts
        else throw new Error(`file extension ${entry} not supported`)
    }

    public getEntryFilePath () {
        return this.entry
    }

    public getEntrySourceFile (): SanSourceFile {
        return this.files.get(this.entry)
    }

    public addFile (filepath: string, sourceFile: SanSourceFile) {
        const ext = extname(filepath)
        const moduleSpecifier = filepath.substr(0, filepath.length - ext.length)
        this.modules.set(moduleSpecifier, sourceFile)
        this.files.set(filepath, sourceFile)
    }

    public getFile (moduleSpecifier: string) {
        if (this.files.has(moduleSpecifier)) {
            return this.files.get(moduleSpecifier)
        }
        return this.modules.get(moduleSpecifier)
    }

    public * getFilepaths () {
        return this.files.keys()
    }

    public * getSouceFiles () {
        return this.files.values()
    }

    public getFiles (): IterableIterator<[string, SanSourceFile]> {
        return this.files.entries()
    }

    public getEntryComponentClass () {
        const entry = this.getEntryFilePath()
        if (this.sourceFileType === SourceFileType.js) {
            return new CommonJS().require(entry)
        }
        const commonJS = new CommonJS(filepath => {
            const sourceFile = this.getFile(filepath)
            if (!sourceFile) throw new Error(`file ${filepath} not found`)
            const js = ts2js(sourceFile.origin)
            return js
        })
        return commonJS.require(entry).default
    }
}
