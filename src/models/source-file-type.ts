import { extname } from 'path'

export enum SourceFileType {
    js = '.js',
    ts = '.ts'
}

export function getSourceFileType (filepath: string): SourceFileType | null {
    const ext = extname(filepath)
    if (ext === '.js') return SourceFileType.js
    if (ext === '.ts') return SourceFileType.ts
    return null
}

export function getSourceFileTypeOrThrow (filepath: string) {
    const sourceFileType = getSourceFileType(filepath)
    if (!sourceFileType) throw new Error(`file extension of ${filepath} not supported`)
    return sourceFileType
}
