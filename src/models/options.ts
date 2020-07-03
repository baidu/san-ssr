import { ComponentConstructor } from 'san'

export interface TypeScriptFileDescriptor {
    /**
     * 文件路径
     */
    filePath: string
    /**
     * 文件内容
     */
    fileContent: string
}
export type ComponentClass = ComponentConstructor<{}, any>

export type FilePath = string

export type CompileInput = TypeScriptFileDescriptor | FilePath | ComponentClass

export function isTypeScriptFileDescriptor (input: CompileInput): input is TypeScriptFileDescriptor {
    return typeof input['filePath'] === 'string' && typeof input['fileContent'] === 'string'
}

export function isFilePath (input: CompileInput): input is FilePath {
    return typeof input === 'string'
}

export function isComponentClass (input: CompileInput): input is ComponentClass {
    return !isFilePath(input) && !isTypeScriptFileDescriptor(input)
}
