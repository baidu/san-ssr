import { getComponentClassIdentifier, isChildClassOf } from './ast-util'
import { SanSourceFile } from './san-sourcefile'
import { Project, SourceFile, ClassDeclaration } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'
import { Component } from './component'
import debugFactory from 'debug'

const debug = debugFactory('component-parser')

export class ComponentParser {
    private root: string
    private tsconfigPath: string
    private project: Project
    private idPropertyName: string
    private id: number = 0

    constructor (
        tsconfigPath = getDefaultConfigPath(),
        idPropertyName = 'spsrCid'
    ) {
        debug('using tsconfig:', tsconfigPath)
        this.idPropertyName = idPropertyName
        this.tsconfigPath = tsconfigPath
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    parseComponent (componentTS?: string, componentJS?: string): Component {
        debug('parsComponent', componentTS, componentJS)
        const comp = new Component(componentTS, componentJS)
        if (componentTS) {
            for (const [path, file] of this.getComponentFiles(componentTS)) {
                comp.addFile(path, this.parseSanSourceFile(file))
            }
        }
        return comp
    }

    private getComponentFiles (entryTSFile): Map<string, SourceFile> {
        const sourceFile = this.project.getSourceFile(entryTSFile)
        if (!sourceFile) throw new Error('could not get sourcefile:' + entryTSFile)
        return new Map([[
            entryTSFile,
            sourceFile
        ]])
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
            this.normalizeComponentClass(clazz)
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

    normalizeComponentClass (clazz: ClassDeclaration) {
        if (!clazz.getName()) {
            // clazz.rename('SpsrComponent')    // this throws
            throw new Error('anonymous component class is not supported')
        }

        for (const prop of clazz.getProperties()) {
            const name = prop.getName()

            if (name === 'filters' || name === 'computed') {
                if (!prop.isStatic()) prop.setIsStatic(true)
            }
        }
    }
}
