import { SourceFile, ClassDeclaration, PropertyDeclaration } from 'ts-morph'
import { SourceFileType } from '../models/source-file-type'
import { Component } from './component'

export class SanSourceFile {
    public tsSourceFile: SourceFile
    public componentClassIdentifier: string
    public fakeProperties: PropertyDeclaration[] = []
    public componentClassDeclarations: Map<number, ClassDeclaration> = new Map()
    public componentClasses: Map<number, typeof Component> = new Map()
    public fileType: SourceFileType

    private filepath: string

    private constructor ({
        sourceFile = undefined,
        componentClassIdentifier = undefined,
        filepath = undefined,
        fileType
    }) {
        this.tsSourceFile = sourceFile
        this.componentClassIdentifier = componentClassIdentifier
        this.fileType = fileType
        this.filepath = filepath || sourceFile.getFilePath()
    }

    static createFromTSSourceFile (sourceFile: SourceFile, componentClassIdentifier?: string) {
        return new SanSourceFile({
            sourceFile, componentClassIdentifier, fileType: SourceFileType.ts
        })
    }

    static createFromJSFilePath (filepath: string) {
        return new SanSourceFile({
            filepath, fileType: SourceFileType.js
        })
    }

    getClassDeclarations () {
        return this.tsSourceFile.getClasses()
    }

    getFullText (): string {
        return this.tsSourceFile.getFullText()
    }

    getFilePath (): string {
        return this.fileType === SourceFileType.ts ? this.tsSourceFile.getFilePath() : this.filepath
    }

    getClass (name: string) {
        return this.tsSourceFile.getClass(name)
    }
}
