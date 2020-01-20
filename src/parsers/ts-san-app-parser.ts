import { getComponentClassIdentifier, isChildClassOf } from '../utils/ast-util'
import { ComponentTree } from '../models/component-tree'
import { ComponentConstructor } from 'san'
import { resolve } from 'path'
import { CommonJS, Modules } from '../loaders/common-js'
import { tsSourceFile2js } from '../transpilers/ts2js'
import { normalizeComponentClass } from './normalize-component'
import { SanSourceFile } from '../models/san-sourcefile'
import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import { getDefaultTSConfigPathOrThrow } from './tsconfig'
import { getDependenciesRecursively } from './dependency-resolver'
import { SanApp } from '../models/san-app'
import { SourceFileType, getSourceFileTypeOrThrow } from '../models/source-file-type'
import { SanAppParser } from './san-app-parser'
import debugFactory from 'debug'

const debug = debugFactory('ts-component-parser')

export class TSSanAppParser implements SanAppParser {
    public project: Project
    private id: number = 0
    private cache: Map<string, SanSourceFile> = new Map()
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

    static createUsingTsconfig (tsConfigFilePath: string) {
        return new TSSanAppParser(new Project({ tsConfigFilePath }))
    }

    static createUsingDefaultTypeScriptConfig () {
        return TSSanAppParser.createUsingTsconfig(getDefaultTSConfigPathOrThrow())
    }

    public parseSanAppFromComponentClass (ComponentClass: ComponentConstructor<{}, {}>): SanApp {
        const sourceFile = SanSourceFile.createVirtualSourceFile()
        const componentTree = new ComponentTree(ComponentClass)
        return new SanApp(sourceFile, this.projectFiles, componentTree)
    }

    public parseSanApp (entryFilePath: string, modules: Modules = {}): SanApp {
        debug('parsComponent', entryFilePath)
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
        return new SanApp(entrySourceFile, this.projectFiles, componentTree)
    }

    private evaluateFile (sourceFile: SanSourceFile, modules: Modules) {
        Object.assign(this.modules, modules)
        const exports = this.commonJS.require(sourceFile.getFilePath())
        return sourceFile.fileType === SourceFileType.js ? exports : exports.default
    }

    private parseSanSourceFile (sourceFile: SourceFile): SanSourceFile {
        const filePath = sourceFile.getFilePath()
        if (!this.cache.has(filePath)) {
            this.cache.set(filePath, this.doParseSanSourceFile(sourceFile))
        }
        return this.cache.get(filePath)!
    }

    private doParseSanSourceFile (sourceFile: SourceFile): SanSourceFile {
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
