import { SanSourceFile } from './san-sourcefile'
import { Component as SanComponent } from 'san'

export class Component {
    private files: Map<string, SanSourceFile> = new Map()
    private entryFile: string
    private componentClass: typeof SanComponent

    constructor (entryFile: string) {
        this.entryFile = entryFile
    }

    addFile (path: string, file: SanSourceFile) {
        this.files.set(path, file)
    }

    getComponentSourceFile (): SanSourceFile {
        return this.files.get(this.entryFile)
    }

    getFile (path: string) {
        return this.files.get(path)
    }

    getFiles () {
        return this.files
    }
}
