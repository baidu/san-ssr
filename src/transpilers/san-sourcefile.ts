import { SourceFile, ClassDeclaration, PropertyDeclaration } from 'ts-morph'

export class SanSourceFile {
    public origin: SourceFile
    public componentClasses: Map<number, ClassDeclaration> = new Map()
    public componentClassIdentifier: string
    public fakeProperties: PropertyDeclaration[] = []

    constructor (sourceFile: SourceFile, componentClassIdentifier?: string) {
        this.origin = sourceFile
        this.componentClassIdentifier = componentClassIdentifier
    }

    getFullText (): string {
        return this.origin.getFullText()
    }

    getFilePath (): string {
        return this.origin.getFilePath()
    }
}
