import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import debugFactory from 'debug'
import { ComponentConstructor } from 'san'
import { resolve } from 'path'
import { getComponentClassIdentifier, isChildClassOf } from '../utils/ast-util'
import { ComponentTree } from '../models/component-tree'
import { CommonJS, Modules } from '../loaders/common-js'
import { tsSourceFile2js } from '../transpilers/ts2js'
import { normalizeComponentClass } from './normalize-component'
import { SanSourceFile } from '../models/san-source-file'
import { getDependenciesRecursively } from './dependency-resolver'
import { SanApp } from '../models/san-app'
import { SourceFileType, getSourceFileTypeOrThrow } from '../models/source-file-type'
import { SanAppParser } from './san-app-parser'

const debug = debugFactory('ts-component-parser')

export class TSSanAppParser implements SanAppParser {
    public project: Project
    private id: number = 0
    private projectFiles: Map<string, SanSourceFile> = new Map()
    private commonJS: CommonJS
    private modules = {}

    constructor (project: Project) {
        debug('SanAppParser created')
        this.project = project
        this.commonJS = new CommonJS(this.modules, (filepath: string) => {
            if (!this.projectFiles.has(filepath)) return undefined
            const sourceFile = this.projectFiles.get(filepath)!
            return tsSourceFile2js(sourceFile, this.project.getCompilerOptions())
        })
    }

    public parseSanAppFromComponentClass (ComponentClass: ComponentConstructor<{}, {}>): SanApp {
        const sourceFile = SanSourceFile.createVirtualSourceFile()
        const componentTree = new ComponentTree(ComponentClass)
        return new SanApp(sourceFile, this.projectFiles, componentTree)
    }

    public parseSanApp (entryFilePath: string, modules: Modules = {}): SanApp {
        debug('parseSanApp', entryFilePath)
        entryFilePath = resolve(entryFilePath)
        this.project.addExistingSourceFileIfExists(entryFilePath)
        const entrySourceFile = getSourceFileTypeOrThrow(entryFilePath) === SourceFileType.js
            ? SanSourceFile.createFromJSFilePath(entryFilePath)
            : this.parseSanSourceFile(this.project.getSourceFileOrThrow(entryFilePath))

        this.projectFiles.set(entryFilePath, entrySourceFile)

        if (entrySourceFile.tsSourceFile) {
            const sourceFiles = getDependenciesRecursively(entrySourceFile.tsSourceFile)

            for (const [path, file] of sourceFiles) {
                this.projectFiles.set(path, this.parseSanSourceFile(file))
            }
        }

        const entryClass = this.evaluateFile(entrySourceFile, modules)
        const componentTree = new ComponentTree(entryClass)
        const app = new SanApp(entrySourceFile, this.projectFiles, componentTree)
        return app
    }

    private evaluateFile (sourceFile: SanSourceFile, modules: Modules) {
        Object.assign(this.modules, modules)
        const exports = this.commonJS.require(sourceFile.getFilePath())
        return sourceFile.fileType === SourceFileType.js ? exports : exports.default
    }

    private parseSanSourceFile (sourceFile: SourceFile): SanSourceFile {
        debug('parseSanSourceFile', sourceFile.getFilePath())
        sourceFile.refreshFromFileSystemSync()
        const componentClassIdentifier = getComponentClassIdentifier(sourceFile)
        const sanSourceFile = SanSourceFile.createFromTSSourceFile(sourceFile, componentClassIdentifier)

        if (!componentClassIdentifier) return sanSourceFile
        debug('san identifier', componentClassIdentifier)

        for (const clazz of sourceFile.getClasses()) {
            if (!isChildClassOf(clazz, componentClassIdentifier)) continue
            normalizeComponentClass(clazz)
            this.setComponentID(sanSourceFile, clazz)
        }
        return sanSourceFile
    }

    private setComponentID (sourceFile: SanSourceFile, clazz: ClassDeclaration) {
        const decl = clazz.addProperty({
            isStatic: true,
            name: 'sanssrCid',
            type: 'number',
            initializer: String(this.id)
        })
        sourceFile.fakeProperties.push(decl)
        sourceFile.componentClassDeclarations.set(this.id++, clazz)
    }
}
