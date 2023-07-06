/**
 * San 项目
 *
 * 一个 SanProject 实例表示一个 San 项目，同一个项目中多次编译可以复用一些已经建立好的对象。
 * 尤其对于从 TypeScript 源码开始 SSR 的情况，多次编译之间，整个 TypeScript 项目里的所有（包括类型）文件是可以缓存的。
 *
 * 对使用者建议如下：
 *
 * 1. 简单的 SSR 可以直接用 src/index.ts 里的 compileToRenderer 和 compileToSource。
 * 2. 复杂的编译过程建议使用 SanProject，它提供了更精细的 API。上述两个 API 其实是 SanProject 一个包装。
 */

import type { Component } from 'san'
import type {
    TypedSanSourceFile, DynamicSanSourceFile, SanSourceFile, JSSanSourceFile
} from '../models/san-source-file'
import type {
    parseSanSourceFileOptions,
    RenderOptions,
    strongParseSanSourceFileOptions
} from '../compilers/renderer-options'
import type { Renderer } from './renderer'
import type { CompileOptions } from '../target-js/compilers/compile-options'
import type { TargetCodeGenerator } from '../models/target-code-generator'
import type { CompilerOptions } from 'typescript'
import assert from 'assert'
import { Project } from 'ts-morph'
import { ComponentClassParser } from '../parsers/component-class-parser'
import { TypeScriptSanParser } from '../parsers/typescript-san-parser'
import { JavaScriptSanParser } from '../parsers/javascript-san-parser'
import { SanFileParser } from '../parsers/san-file-parser'
import { removeModules } from '../parsers/remove-modules'
import ToJSCompiler from '../target-js/index'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import {
    isFileDescriptor, isSanFileDescriptor, isComponentClass, ComponentClass, FileDescriptor, CompileInput
} from './options'

type TargetCodeGeneratorClass<T extends TargetCodeGenerator = TargetCodeGenerator> = { new(project: SanProject): T }

/**
 * SanProject 对应于 TypeScript 项目，即 tsconfig.json 及其引用的所有文件构成的集合。
 */
export class SanProject {
    public tsProject?: Project

    private compilers: Map<TargetCodeGeneratorClass, TargetCodeGenerator> = new Map()

    constructor (public tsConfigFilePath: null | string | undefined = getDefaultTSConfigPath()) {
        if (tsConfigFilePath !== null) {
            this.tsProject = new Project({ tsConfigFilePath, addFilesFromTsConfig: false })
        }
    }

    /**
     * 兼容旧版用法
     * @alias SanProject.compileToSource
     */
    public compile (input: CompileInput, target: string | TargetCodeGeneratorClass = 'js', options = {}) {
        return this.compileToSource(input, target, options)
    }

    /**
     * 源文件/组件类编译到源代码
     */
    public compileToSource<T extends TargetCodeGenerator> (
        input: CompileInput,
        target: string | TargetCodeGeneratorClass<T> = 'js',
        options: RenderOptions = {}
    ) {
        const sanSourceFile = this.parseSanSourceFile(input, { sanReferenceInfo: options.sanReferenceInfo })
        // 删除配置中指定的在 ssr 下无需引入的模块
        const { removeModules: modules } = options
        if (modules && modules.length) {
            removeModules(sanSourceFile, modules)
        }
        const compiler = this.getOrCreateTargetCodeGenerator(target)
        return compiler.compileToSource(sanSourceFile, options)
    }

    /**
     * 解析 CompileInput 实例中的 San 相关信息
     *
     * CompileInput 可以是 JS、TS 源文件，也可以是组件类，得到的 SanSourceFile 里包含这个文件里
     * San 相关的信息，比如有多少个组件？每个组件有哪些方法？以及得到 template 对应的 ANode 树。
     */
    public parseSanSourceFile (componentClass: ComponentClass, options?: parseSanSourceFileOptions): DynamicSanSourceFile
    public parseSanSourceFile (fileDescriptor: FileDescriptor, options?: parseSanSourceFileOptions): TypedSanSourceFile
    public parseSanSourceFile (filecontent: string, options?: parseSanSourceFileOptions): JSSanSourceFile
    public parseSanSourceFile (input: CompileInput, options?: parseSanSourceFileOptions): SanSourceFile
    public parseSanSourceFile (input: CompileInput, options?: parseSanSourceFileOptions): SanSourceFile {
        if (isComponentClass(input)) return new ComponentClassParser(input, '').parse()

        const formattedOptions = this.checkAndFormatParseSanSourceFileOptions(options)
        if (isSanFileDescriptor(input)) {
            return new SanFileParser(
                input.scriptContent,
                input.templateContent,
                input.filePath,
                formattedOptions
            ).parse()
        }

        const filePath = isFileDescriptor(input) ? input.filePath : input
        const fileContent = isFileDescriptor(input) ? input.fileContent : undefined
        if (/\.ts$/.test(filePath)) {
            if (!this.tsProject) throw new Error(`Error parsing ${input}, tsconfig not specified`)
            const sourceFile = fileContent
                ? this.tsProject.createSourceFile(filePath, fileContent, { overwrite: true })
                : this.tsProject.addSourceFileAtPath(filePath)
            !fileContent && sourceFile.refreshFromFileSystemSync()
            return new TypeScriptSanParser().parse(sourceFile, formattedOptions)
        }
        return new JavaScriptSanParser(filePath, formattedOptions, fileContent).parse()
    }

    private checkAndFormatParseSanSourceFileOptions (options?: parseSanSourceFileOptions)
        : strongParseSanSourceFileOptions {
        const moduleName = options?.sanReferenceInfo?.moduleName
        const methodName = options?.sanReferenceInfo?.methodName
        const className = options?.sanReferenceInfo?.className
        return {
            sanReferenceInfo: {
                moduleName: moduleName
                    ? Array.isArray(moduleName) ? moduleName : [moduleName]
                    : ['san'],
                className: className
                    ? Array.isArray(className) ? className : [className]
                    : ['Component'],
                methodName: methodName
                    ? Array.isArray(methodName) ? methodName : [methodName]
                    : ['defineComponent']
            }
        }
    }

    /**
     * 编译成当前 JavaScript 进程里的 render 函数
     *
     *  * `target` 固定为 "js"
     *  * `options.bareFunction` 固定为 true
     */
    public compileToRenderer (
        componentClass: Component<any>,
        options?: CompileOptions
    ): Renderer {
        const sanSourceFile = new ComponentClassParser(componentClass, '').parse()
        const compiler = this.getOrCreateTargetCodeGenerator(ToJSCompiler)
        return compiler.compileToRenderer(sanSourceFile, options)
    }

    /**
     * 输出工具库：组件渲染时需要使用的公共工具。
     */
    public emitHelpers (target: string, options: any = {}) {
        const compiler = this.getOrCreateTargetCodeGenerator(target)
        assert(compiler.emitHelpers, `emit helpers not supported by "${target}"`)
        return compiler.emitHelpers(options)
    }

    public getCompilerOptionsOrThrow (): CompilerOptions {
        return this.tsProject!.getCompilerOptions() as CompilerOptions
    }

    /**
     * 得到目标代码生成器的实例
     *
     * 如果不存在就去加载一个，如果已经加载过就把它存起来。
     */
    public getOrCreateTargetCodeGenerator<T extends TargetCodeGenerator = TargetCodeGenerator> (
        target: string | TargetCodeGeneratorClass<T>
    ): T {
        const CC: TargetCodeGeneratorClass<T> = this.loadTargetCodeGenerator(target)

        if (!this.compilers.has(CC)) {
            this.compilers.set(CC, new CC(this))
        }
        return this.compilers.get(CC) as T
    }

    /**
     * 加载目标代码生成器
     *
     * 如果是 san-ssr-target-js，直接从当前仓库的子目录下加载。
     * 如果是其他的 target，用 require.resolve 来找。
     */
    private loadTargetCodeGenerator (target: string | TargetCodeGeneratorClass) {
        if (typeof target !== 'string') return target

        const name = `san-ssr-target-${target}`
        if (name === 'san-ssr-target-js') return ToJSCompiler

        let path
        try {
            path = require.resolve(name)
        } catch (e) {
            throw new Error(`failed to load "san-ssr-target-${target}"`)
        }

        const plugin = require(path)
        return plugin.default || plugin
    }
}
