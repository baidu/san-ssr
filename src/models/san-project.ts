import { ComponentConstructor } from 'san'
import { Project } from 'ts-morph'
import { resolve } from 'path'
import { ComponentClassParser } from '../parsers/component-class-parser'
import { TypeScriptSanParser } from '../parsers/typescript-san-parser'
import { DynamicSanSourceFile, SanSourceFile } from '../models/san-source-file'
import ToJSCompiler, { ToJSCompileOptions } from '../target-js/index'
import { Renderer } from './renderer'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import { Compiler } from '../models/compiler'

type CompilerClass<T extends Compiler = Compiler> = { new(project: SanProject): T }

/**
 * A SanProject corresponds to a TypeScript project,
 * which is is a set of source files in a directory using one tsconfig.json.
 */
export class SanProject {
    public tsProject?: Project

    private compilers: Map<CompilerClass, Compiler> = new Map()

    constructor (public tsConfigFilePath: null | string | undefined = getDefaultTSConfigPath()) {
        if (tsConfigFilePath !== null) {
            this.tsProject = new Project({ tsConfigFilePath, addFilesFromTsConfig: false })
        }
    }

    /**
     * 兼容旧版用法
     * @alias SanProject.compileToSource
     */
    public compile (
        filepathOrComponentClass: string | ComponentConstructor<{}, any>,
        target: string | CompilerClass = 'js',
        options = {}
    ) {
        return this.compileToSource(filepathOrComponentClass, target, options)
    }

    /**
     * 源文件/组件类编译到源代码
     */
    public compileToSource<T extends Compiler> (
        filepathOrComponentClass: string | ComponentConstructor<{}, any>,
        target: string | CompilerClass<T> = 'js',
        options = {}
    ) {
        const sanSourceFile = this.parseSanSourceFile(filepathOrComponentClass)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compileToSource(sanSourceFile, options)
    }

    /**
     * 源文件/组件类解析为 SanSourceFile
     */
    public parseSanSourceFile (componentClass: ComponentConstructor<{}, any>): DynamicSanSourceFile;
    public parseSanSourceFile (filepathOrComponentClass: string | ComponentConstructor<{}, any>): SanSourceFile
    public parseSanSourceFile (filepathOrComponentClass: string | ComponentConstructor<{}, any>): SanSourceFile {
        if (typeof filepathOrComponentClass !== 'string') {
            return new ComponentClassParser(filepathOrComponentClass, '').parse()
        }
        if (/\.ts$/.test(filepathOrComponentClass)) {
            if (!this.tsProject) {
                throw new Error(`Error parsing ${filepathOrComponentClass}, tsconfig not specified`)
            }
            const filePath = resolve(filepathOrComponentClass)
            this.tsProject.addExistingSourceFileIfExists(filePath)
            const sourceFile = this.tsProject.getSourceFileOrThrow(filePath)
            sourceFile.refreshFromFileSystemSync()
            return new TypeScriptSanParser(sourceFile).parse()
        }
        return new ComponentClassParser(require(filepathOrComponentClass), filepathOrComponentClass).parse()
    }

    /**
     * 编译成当前 JavaScript 进程里的 render 函数
     *
     *  * `target` 固定为 "js"
     *  * `options.bareFunction` 固定为 true
     */
    public compileToRenderer (
        componentClass: ComponentConstructor<{}, any>,
        options?: ToJSCompileOptions
    ): Renderer {
        const sanSourceFile = new ComponentClassParser(componentClass, '').parse()
        const compiler = this.getOrCreateCompilerInstance(ToJSCompiler)
        return compiler.compileToRenderer(sanSourceFile, options)
    }

    public getCompilerOptionsOrThrow () {
        return this.tsProject!.getCompilerOptions()
    }

    public getOrCreateCompilerInstance<T extends Compiler = Compiler> (target: string | CompilerClass<T>): T {
        const CC: CompilerClass<T> = this.loadCompilerClass(target)

        if (!this.compilers.has(CC)) {
            this.compilers.set(CC, new CC(this))
        }
        return this.compilers.get(CC) as T
    }

    public loadCompilerClass (target: string | CompilerClass) {
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
