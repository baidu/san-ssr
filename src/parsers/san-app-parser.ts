import { getComponentClassIdentifier, isChildClassOf } from '../utils/ast-util'
import { ComponentTree } from '../models/component-tree'
import { ComponentConstructor } from 'san'
import { resolve } from 'path'
import { CommonJS, Modules } from '../loaders/common-js'
import { tsSourceFile2js } from '../transpilers/ts2js'
import { normalizeComponentClass } from './normalize-component'
import { SanSourceFile } from '../models/san-sourcefile'
import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import { getDefaultTSConfigPath } from './tsconfig'
import { getDependenciesRecursively } from './dependency-resolver'
import { SanApp } from '../models/san-app'
import { SourceFileType, getSourceFileTypeOrThrow } from '../models/source-file-type'
import debugFactory from 'debug'

const debug = debugFactory('component-parser')

// TODO 封装进 SanApp.create()，不再暴露给上层
export class SanAppParser {
    public project: Project
    private root: string
    private id: number = 0
    private cache: Map<string, SanSourceFile> = new Map()
    private projectFiles: Map<string, SanSourceFile> = new Map()
    private commonJS: CommonJS
    private modules = {}

    constructor (project: Project) {
        debug('SanAppParser created')
        this.project = project
        this.commonJS = new CommonJS(this.modules, filepath => {
            if (!this.projectFiles.has(filepath)) return undefined
            const sourceFile = this.projectFiles.get(filepath)
            return tsSourceFile2js(sourceFile.tsSourceFile, this.project.getCompilerOptions())
        })
    }

    static createUsingTsconfig (tsConfigFilePath: string) {
        return new SanAppParser(new Project({ tsConfigFilePath }))
    }

    static createUsingDefaultTypeScriptConfig () {
        return SanAppParser.createUsingTsconfig(getDefaultTSConfigPath())
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

        if (entrySourceFile.fileType === SourceFileType.ts) {
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
        // TODO move entryFile to constructor argument and remove this branch
        if (sourceFile.fileType === SourceFileType.js) {
            return new CommonJS(this.modules).require(sourceFile.getFilePath())
        }
        Object.assign(this.modules, modules)
        return this.commonJS.require(sourceFile.getFilePath()).default
    }

    private parseSanSourceFile (sourceFile: SourceFile) {
        const filePath = sourceFile.getFilePath()
        if (!this.cache.has(filePath)) {
            this.cache.set(filePath, this.doParseSanSourceFile(sourceFile))
        }
        return this.cache.get(filePath)
    }

    private doParseSanSourceFile (sourceFile: SourceFile) {
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

    public setComponentID (sourceFile: SanSourceFile, clazz: ClassDeclaration) {
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
