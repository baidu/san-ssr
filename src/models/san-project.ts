import { Component as SanComponent } from 'san'
import { Project } from 'ts-morph'
import { ToJSCompileOptions } from '../target-js/index'
import { TSSanAppParser } from '../parsers/ts-san-app-parser'
import { Renderer } from './renderer'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import { Compiler } from '../models/compiler'
import { JSSanAppParser } from '../parsers/js-san-app-parser'
import { Modules } from '../loaders/common-js'
import { loadCompilerClassByTarget } from '../loaders/target'

export interface SanProjectOptions {
    tsConfigFilePath?: string | null,
    modules?: Modules
}

interface CompileOptions {
    [key: string]: any
}

type CompilerClass = { new(options: { project: SanProject }): Compiler }

/**
 * A SanProject corresponds to a TypeScript project,
 * which is is a set of source files in a directory using one tsconfig.json.
 */
export class SanProject {
    public tsProject?: Project
    public tsConfigFilePath?: string | null

    private compilers: Map<CompilerClass, Compiler> = new Map()
    private modules: Modules

    constructor ({
        tsConfigFilePath = getDefaultTSConfigPath(),
        modules = {}
    }: SanProjectOptions = {}) {
        if (tsConfigFilePath) {}
        this.tsConfigFilePath = tsConfigFilePath
        if (tsConfigFilePath !== null) {
            this.tsProject = new Project({ tsConfigFilePath })
        }
        this.modules = modules
    }

    /**
     * @alias SanProject.compileToSource
     */
    public compile (
        filepathOrComponentClass: string | typeof SanComponent,
        target: string | CompilerClass = 'js',
        options: CompileOptions = {}
    ) {
        return this.compileToSource(filepathOrComponentClass, target, options)
    }
    public compileToSource (
        filepathOrComponentClass: string | typeof SanComponent,
        target: string | CompilerClass = 'js',
        options: CompileOptions = {}
    ) {
        const sanApp = this.parseSanApp(filepathOrComponentClass)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compile(sanApp, options)
    }
    public parseSanApp (
        filepathOrComponentClass: string | typeof SanComponent
    ) {
        const parser = this.getParser()
        const sanApp = typeof filepathOrComponentClass === 'string'
            ? parser.parseSanApp(filepathOrComponentClass, this.modules)
            : parser.parseSanAppFromComponentClass(filepathOrComponentClass)
        return sanApp
    }

    /**
     * Compile to render function in current JavaScript context.
     *
     *  * `target` is fixed to "js"
     *  * `options.bareFunction` is fixed to true
     */
    public compileToRenderer (
        filepathOrComponentClass: string | typeof SanComponent,
        options?: ToJSCompileOptions
    ): Renderer {
        const sanApp = this.parseSanApp(filepathOrComponentClass)
        const compiler = this.getOrCreateCompilerInstance('js')
        return compiler.compileToRenderer!(sanApp, options)
    }

    private getParser () {
        return this.tsProject ? new TSSanAppParser(this.tsProject) : new JSSanAppParser()
    }

    private getOrCreateCompilerInstance (target: string | CompilerClass): Compiler {
        const CompilerClass = this.loadCompilerClass(target)

        if (!this.compilers.has(CompilerClass)) {
            this.compilers.set(CompilerClass, new CompilerClass(this))
        }
        return this.compilers.get(CompilerClass)!
    }

    private loadCompilerClass (target: string | CompilerClass) {
        if (typeof target === 'string') return loadCompilerClassByTarget(target)
        return target
    }
}
