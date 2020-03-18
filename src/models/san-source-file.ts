import { SourceFile, ClassDeclaration, PropertyDeclaration } from 'ts-morph'
import { readFileSync } from 'fs'
import { ok } from 'assert'
import { SourceFileType } from '../models/source-file-type'
import { ComponentInfo } from '../models/component-info'

interface SanSourceFileOptions {
    sourceFile?: SourceFile
    componentClassIdentifier?: string
    fileType: SourceFileType
    filepath: string
}

/**
 * 一个 San 项目中的远文件
 */
export class SanSourceFile {
    // 是 TypeScript 文件时非空
    public tsSourceFile?: SourceFile

    // 是 TypeScript 文件且包含 San 组件时非空
    public componentClassIdentifier?: string
    public fakeProperties: PropertyDeclaration[] = []
    public componentClassDeclarations: Map<number, ClassDeclaration> = new Map()
    public componentInfos: Map<number, ComponentInfo> = new Map()
    public fileType: SourceFileType

    private filepath: string

    private constructor ({
        sourceFile,
        componentClassIdentifier,
        filepath,
        fileType
    }: SanSourceFileOptions) {
        this.tsSourceFile = sourceFile
        this.componentClassIdentifier = componentClassIdentifier
        this.fileType = fileType
        this.filepath = filepath
    }

    static createFromTSSourceFile (sourceFile: SourceFile, componentClassIdentifier?: string) {
        return new SanSourceFile({
            sourceFile,
            componentClassIdentifier,
            fileType: SourceFileType.ts,
            filepath: sourceFile.getFilePath()
        })
    }

    static createFromJSFilePath (filepath: string) {
        return new SanSourceFile({
            filepath, fileType: SourceFileType.js
        })
    }

    static createVirtualSourceFile () {
        return new SanSourceFile({
            filepath: '/tmp/virtual-file',
            fileType: SourceFileType.js
        })
    }

    getClassDeclarations () {
        ok(this.tsSourceFile, 'cannot get class declarations for non-typescript source file')
        return this.tsSourceFile!.getClasses()
    }

    getFullText (): string {
        return this.tsSourceFile
            ? this.tsSourceFile.getFullText()
            : readFileSync(this.filepath, 'utf8')
    }

    getFilePath (): string {
        return this.filepath
    }

    getClass (name: string) {
        ok(this.tsSourceFile, 'cannot get class for non-typescript source file')
        return this.tsSourceFile!.getClass(name)
    }
}
