import { ComponentTree } from '../models/component-tree'
import { ComponentConstructor } from 'san'
import { resolve } from 'path'
import { CommonJS } from '../loaders/common-js'
import { SanSourceFile } from '../models/san-source-file'
import { SanApp } from '../models/san-app'
import debugFactory from 'debug'
import { SanAppParser } from './san-app-parser'

const debug = debugFactory('js-component-parser')

export class JSSanAppParser implements SanAppParser {
    private projectFiles: Map<string, SanSourceFile> = new Map()
    private commonJS: CommonJS

    constructor () {
        debug('SanAppParser created')
        this.commonJS = new CommonJS()
    }

    public parseSanAppFromComponentClass (ComponentClass: ComponentConstructor<{}, {}>): SanApp {
        const sourceFile = SanSourceFile.createVirtualSourceFile()
        const componentTree = new ComponentTree(ComponentClass)
        return new SanApp(sourceFile, this.projectFiles, componentTree)
    }

    public parseSanApp (entryFilePath: string): SanApp {
        debug('parsComponent', entryFilePath)
        entryFilePath = resolve(entryFilePath)
        const entrySourceFile = SanSourceFile.createFromJSFilePath(entryFilePath)
        this.projectFiles.set(entryFilePath, entrySourceFile)

        const entryClass = this.evaluateFile(entrySourceFile)
        const componentTree = new ComponentTree(entryClass)
        return new SanApp(entrySourceFile, this.projectFiles, componentTree)
    }

    private evaluateFile (sourceFile: SanSourceFile) {
        return require(sourceFile.getFilePath())
    }
}
