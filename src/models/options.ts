/**
 * SSR 的输入参数
 *
 * SanProject#compileToSource() 和 compileToRenderer() 的输入参数为 CompileInput
 * 这里定义了 CompileInput 相关的类型，以及对应的 Type Guards。
 */
import { ComponentConstructor } from 'san'

/**
 * 文件尚未存在，但其内容已经在内存里的情况。比如 Webpack 编译时。
 */
export interface FileDescriptor {
    /**
     * 文件路径
     */
    filePath: string
    /**
     * 文件内容
     */
    fileContent: string
}

/**
 * .san 文件描述
 *
 * - 单独给 script 文件内容、template 文件内容的情况。
 * - 一个 script 内只有一个组件。
 */
export interface SanFileDescriptor {
    /**
     * 文件路径
     */
    filePath: string
    /**
     * 脚本内容
     */
    scriptContent: string
    /**
     * 模板内容
     */
    templateContent: string
}
export type ComponentClass = ComponentConstructor<{}, any>

export type FilePath = string

export type CompileInput = SanFileDescriptor | FileDescriptor | FilePath | ComponentClass

export function isFileDescriptor (input: CompileInput): input is FileDescriptor {
    return typeof input['filePath'] === 'string' && typeof input['fileContent'] === 'string'
}

export function isComponentClass (input: CompileInput): input is ComponentClass {
    return typeof input === 'function'
}

export function isSanFileDescriptor (input: CompileInput): input is SanFileDescriptor {
    return typeof input['templateContent'] === 'string'
}
