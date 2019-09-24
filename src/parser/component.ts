import { SanSourceFile } from './san-sourcefile'
import { readFileSync } from 'fs'
import { ToJSCompiler } from '../transpilers/to-js-compiler'
import { Component as SanComponent } from 'san'

// js ssr 还有一些缺陷，不可用来编译 ES6 或 TypeScript 编写的组件。
type GetComponentStrategy = 'ts-first' | 'js-first'

export class Component {
    private files: Map<string, SanSourceFile> = new Map()
    private entryTS: string
    private entryJS: string
    private componentClass: typeof SanComponent

    constructor (entryTS?: string, entryJS?: string) {
        this.entryTS = entryTS
        this.entryJS = entryJS
    }

    addFile (path: string, file: SanSourceFile) {
        this.files.set(path, file)
    }

    getComponentSourceFile (): SanSourceFile {
        return this.files.get(this.entryTS)
    }

    getFile (path: string) {
        return this.files.get(path)
    }

    getFiles () {
        return this.files
    }

    getComponentClass (toJSCompiler: ToJSCompiler, strategy: GetComponentStrategy = 'ts-first') {
        const useTS = (strategy === 'ts-first' && this.entryTS) || !this.entryJS
        if (useTS) {
            return toJSCompiler.compileAndRun(this.getComponentSourceFile())['default']
        } else {
            return toJSCompiler.run(readFileSync(this.entryJS, 'utf8'))
        }
    }
}
