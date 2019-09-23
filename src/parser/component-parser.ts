import { getComponentClassIdentifier, isChildClassOf } from './ast-util'
import { SanSourceFile } from './san-sourcefile'
import { Project, SourceFile } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'
import { Component } from './component'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

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
        this.idPropertyName = idPropertyName
        this.tsconfigPath = tsconfigPath
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    parseComponent (componentFile: string): Component {
        const comp = new Component(componentFile)
        for (const [path, file] of this.getComponentFiles(componentFile)) {
            comp.addFile(path, this.parseSanSourceFile(file))
        }
        return comp
    }

    private getComponentFiles (componentFile): Map<string, SourceFile> {
        return new Map([[
            componentFile,
            this.project.getSourceFile(componentFile)
        ]])
    }

    private parseSanSourceFile (sourceFile: SourceFile) {
        const componentClassIdentifier = getComponentClassIdentifier(sourceFile)
        const sanSourceFile = new SanSourceFile(
            sourceFile,
            componentClassIdentifier
        )

        if (!componentClassIdentifier) return sanSourceFile
        debug('san identifier', componentClassIdentifier)

        for (const clazz of sourceFile.getClasses()) {
            const name = clazz.getName()
            debug('parsing class', name)

            if (!isChildClassOf(clazz, componentClassIdentifier)) continue

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

            const decl = clazz.addProperty({
                isStatic: true,
                name: this.idPropertyName,
                type: 'number',
                initializer: String(this.id)
            })

            sanSourceFile.fakeProperties.push(decl)
            sanSourceFile.componentClasses.set(this.id, clazz)
            this.id++
        }
        return sanSourceFile
    }
}
