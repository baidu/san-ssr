import { getComponentClassIdentifier, isChildClassOf } from '../utils/ast-util'
import { normalizeComponentClass } from '../transformers/normalize-component'
import { SanSourceFile } from './san-sourcefile'
import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'
import { getDependenciesRecursively } from './dependency-resolver'
import { Component } from './component'
import debugFactory from 'debug'

const debug = debugFactory('component-parser')

export class ComponentParser {
    private root: string
    private id: number = 0
    public project: Project
    public idPropertyName: string

    constructor (project: Project, idPropertyName = 'spsrCid') {
        this.project = project
        this.idPropertyName = idPropertyName
    }

    static createUsingTsconfig (tsConfigFilePath: string) {
        return new ComponentParser(new Project({ tsConfigFilePath }))
    }

    static crateUsingDefaultTsconfig () {
        return ComponentParser.createUsingTsconfig(getDefaultConfigPath())
    }

    public parseComponent (componentTS: string): Component {
        debug('parsComponent', componentTS)
        const comp = new Component(componentTS)
        for (const [path, file] of this.getComponentFiles(componentTS)) {
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

    setComponentID (sourceFile: SanSourceFile, clazz: ClassDeclaration) {
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
