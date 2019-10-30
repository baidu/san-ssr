import { getComponentClassIdentifier, isChildClassOf } from '../utils/ast-util'
import { extname } from 'path'
import { normalizeComponentClass } from '../transformers/normalize-component'
import { SanSourceFile } from '../models/san-sourcefile'
import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'
import { getDependenciesRecursively } from './dependency-resolver'
import { SanApp } from './san-app'
import debugFactory from 'debug'

const debug = debugFactory('component-parser')

export class SanAppParser {
    private root: string
    private id: number = 0
    public project: Project
    public idPropertyName: string

    constructor (project: Project, idPropertyName = 'sanssrCid') {
        this.project = project
        this.idPropertyName = idPropertyName
    }

    static createUsingTsconfig (tsConfigFilePath: string) {
        return new SanAppParser(new Project({ tsConfigFilePath }))
    }

    static createUsingDefaultTypeScriptConfig () {
        return SanAppParser.createUsingTsconfig(getDefaultConfigPath())
    }

    public parseSanApp (entryFilePath: string): SanApp {
        debug('parsComponent', entryFilePath)
        const comp = new SanApp(entryFilePath)
        const ext = extname(entryFilePath)
        if (ext === '.js') return comp

        for (const [path, file] of this.getComponentFiles(entryFilePath)) {
            comp.addFile(path, this.parseSanSourceFile(file))
        }
        return comp
    }

    private getComponentFiles (entryTSFile: string): Map<string, SourceFile> {
        const sourceFile = this.project.getSourceFileOrThrow(entryTSFile)
        return getDependenciesRecursively(sourceFile)
    }

    private parseSanSourceFile (sourceFile: SourceFile) {
        debug('parseSanSourceFile', sourceFile.getFilePath())
        const componentClassIdentifier = getComponentClassIdentifier(sourceFile)
        const sanSourceFile = new SanSourceFile(
            sourceFile,
            componentClassIdentifier
        )

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
            name: this.idPropertyName,
            type: 'number',
            initializer: String(this.id)
        })
        sourceFile.fakeProperties.push(decl)
        sourceFile.componentClasses.set(this.id++, clazz)
    }
}
