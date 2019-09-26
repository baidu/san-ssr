import { SanSourceFile } from './san-sourcefile'
import { Component as SanComponent } from 'san'

// js ssr 还有一些缺陷，不可用来编译 ES6 或 TypeScript 编写的组件。
type GetComponentStrategy = 'ts-first' | 'js-first'

export class Component {
    private files: Map<string, SanSourceFile> = new Map()
    private entry: string
    private componentClass: typeof SanComponent

    constructor (entry?: string) {
        this.entry = entry
    }

    addFile (path: string, file: SanSourceFile) {
        this.files.set(path, file)
    }

    getComponentSourceFile (): SanSourceFile {
        return this.files.get(this.entry)
    }

    getFile (path: string) {
        return this.files.get(path)
    }

    getFiles () {
        return this.files
    }
}
