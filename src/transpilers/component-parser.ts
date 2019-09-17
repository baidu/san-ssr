import { getComponentClassIdentifier, isChildClassOf } from './ast-util'
import { SanSourceFile } from './san-sourcefile'
import { Project, SourceFile } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'

const reservedNames = ['List']

export class ComponentParser {
    private componentFile: string
    private root: string
    private tsconfigPath: string
    private project: Project
    private idPropertyName: string
    private id: number = 0

    constructor (
        componentFile: string,
        tsconfigPath = getDefaultConfigPath(),
        idPropertyName = 'spsrId'
    ) {
        this.idPropertyName = idPropertyName
        this.componentFile = componentFile
        this.tsconfigPath = tsconfigPath
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    parseComponent (): Map<string, SanSourceFile> {
        const files = new Map()

        for (const [path, file] of this.getComponentFiles()) {
            files.set(path, this.parseSanSourceFile(file))
        }
        return files
    }

    private getComponentFiles (): Map<string, SourceFile> {
        return new Map([[
            this.componentFile,
            this.project.getSourceFile(this.componentFile)
        ]])
    }

    private parseSanSourceFile (sourceFile: SourceFile) {
        const componentClassIdentifier = getComponentClassIdentifier(sourceFile)
        const sanSourceFile = new SanSourceFile(
            sourceFile,
            componentClassIdentifier
        )

        if (!componentClassIdentifier) return sanSourceFile

        for (const clazz of sourceFile.getClasses()) {
            const name = clazz.getName()
            if (reservedNames.includes(name)) {
                if (clazz.isExported()) {
                    throw new Error(`${name} is a reserved keyword in PHP`)
                }
                clazz.rename(`SpsrClass${name}`)
            }

            if (!isChildClassOf(clazz, componentClassIdentifier)) continue

            if (!clazz.getName()) {
                // clazz.rename('SpsrComponent')    // this throws
                throw new Error('anonymous component class is not supported')
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
