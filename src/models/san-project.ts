import { sep } from 'path'
import { ToJSCompileOptions } from '../target-js/index'
import { Renderer } from './renderer'
import { Component as SanComponent } from 'san'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import { cwd } from 'process'
import { Compiler } from '../models/compiler'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { Modules } from '../loaders/common-js'
import { loadCompilerClassByTarget } from '../loaders/target'

export interface SanProjectOptions {
    tsConfigFilePath?: string,
    modules?: Modules
}

interface CompileOptions {
    [key: string]: any
}

type CompilerClass = Partial<{ new(): Compiler}>

/**
 * A SanProject corresponds to a TypeScript project,
 * which is is a set of source files in a directory using one tsconfig.json.
 */
export class SanProject {
    public tsProject?: Project
    public tsConfigFilePath?: string

    private root: string
    private compilers: Map<CompilerClass, Compiler> = new Map()
    private modules: Modules
    private parser: SanAppParser

    constructor ({
        tsConfigFilePath = getDefaultTSConfigPath(),
        modules = {}
    }: SanProjectOptions = {}) {
        this.root = tsConfigFilePath
            ? tsConfigFilePath.split(sep).slice(0, -1).join(sep)
            : cwd()
        this.tsConfigFilePath = tsConfigFilePath
        if (tsConfigFilePath !== null) {
            this.tsProject = new Project({ tsConfigFilePath })
        }
        this.modules = modules
        this.parser = new SanAppParser(this.tsProject)
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
        const sanApp = typeof filepathOrComponentClass === 'string'
            ? this.parser.parseSanApp(filepathOrComponentClass, this.modules)
            : this.parser.parseSanAppFromComponentClass(filepathOrComponentClass)
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
        return compiler.compileToRenderer(sanApp, options)
    }

    private getOrCreateCompilerInstance (target: string | CompilerClass) {
        const CompilerClass = this.loadCompilerClass(target)

        if (!this.compilers.has(CompilerClass)) {
            this.compilers.set(CompilerClass, new CompilerClass(this))
        }
        return this.compilers.get(CompilerClass)
    }

    private loadCompilerClass (target: string | CompilerClass) {
        if (typeof target === 'string') return loadCompilerClassByTarget(target)
        return target
    }
}
