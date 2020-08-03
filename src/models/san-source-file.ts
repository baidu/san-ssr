import { SourceFile } from 'ts-morph'
import debugFactory from 'debug'
import { DynamicComponentInfo, ComponentInfo, TypedComponentInfo } from '../models/component-info'

const debug = debugFactory('san-source-file')

/**
 * 一个 San 项目中的源文件
 *
 * 是 TypeScript SourceFile 的封装，但包含组件信息
 */
export abstract class SanSourceFileImpl<T extends ComponentInfo = ComponentInfo> {
    constructor (
        /**
         * 每个组件对应一个 ComponentInfo，它们可以在运行时互相调用，是平铺关系
         */
        public readonly componentInfos: T[],
        /**
         * componentInfos 中作为入口组件的那个
         * - 对于 TypeScript 解析来的组件，是默认导出的组件
         * - 对于 ComponentClass 解析来的组件，是根组件
         */
        public readonly entryComponentInfo?: T
    ) {}

    /**
     * 文件路径对于命名空间（编译到非 JavaScript 时）很有用
     */
    abstract getFilePath(): string
}

export class DynamicSanSourceFile extends SanSourceFileImpl<DynamicComponentInfo> {
    constructor (
        componentInfos: DynamicComponentInfo[],
        private readonly filePath: string,
        public readonly entryComponentInfo: DynamicComponentInfo
    ) {
        super(componentInfos, entryComponentInfo)
    }

    getFilePath () {
        return this.filePath
    }
}

export class TypedSanSourceFile extends SanSourceFileImpl<TypedComponentInfo> {
    constructor (
        componentInfos: TypedComponentInfo[],
        public readonly tsSourceFile: SourceFile,
        entryComponentInfo?: TypedComponentInfo
    ) {
        super(componentInfos, entryComponentInfo)
    }

    getFilePath () {
        return this.tsSourceFile.getFilePath()
    }

    /**
     * 遍历组件类声明
     */
    * getComponentClassDeclarations () {
        for (const info of this.componentInfos) {
            yield info.classDeclaration
        }
    }
}

export type SanSourceFile = DynamicSanSourceFile | TypedSanSourceFile

export function isTypedSanSourceFile (sourceFile: SanSourceFile): sourceFile is TypedSanSourceFile {
    return Object.prototype.hasOwnProperty.call(sourceFile, 'tsSourceFile')
}
