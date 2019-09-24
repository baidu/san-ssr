import { Project, SourceFile, ClassDeclaration, PropertyDeclaration } from 'ts-morph'

export class SanSourceFile {
    public origin: SourceFile
    public componentClasses: Map<number, ClassDeclaration> = new Map()
    public componentClassIdentifier: string
    public fakeProperties: PropertyDeclaration[] = []

    constructor (sourceFile: SourceFile, componentClassIdentifier?: string) {
        this.origin = sourceFile
        this.componentClassIdentifier = componentClassIdentifier
    }

    * getComponentClassNames () {
        for (const clazz of this.componentClasses.values()) {
            yield clazz.getName()
        }
    }

    getClasses () {
        return this.origin.getClasses()
    }

    getFullText (): string {
        return this.origin.getFullText()
    }

    getFilePath (): string {
        return this.origin.getFilePath()
    }

    getClass (name: string) {
        return this.origin.getClass(name)
    }

    openInProject (project: Project) {
        const sourceFile = new SanSourceFile(
            project.getSourceFile(this.getFilePath()),
            this.componentClassIdentifier
        )
        sourceFile.fakeProperties = this.fakeProperties
        sourceFile.componentClasses = this.componentClasses
        return sourceFile
    }
}
