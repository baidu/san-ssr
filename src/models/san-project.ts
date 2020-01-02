import { sep } from 'path'
import { Renderer } from './renderer'
import { Component } from 'san'
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
    public tsProject: Project
    public tsConfigFilePath: string

    private root: string
    private compilers: Map<CompilerClass, Compiler> = new Map()
    private modules: Modules

    constructor ({
        tsConfigFilePath = getDefaultTSConfigPath(),
        modules = {}
    }: SanProjectOptions = {}) {
        this.root = tsConfigFilePath
            ? tsConfigFilePath.split(sep).slice(0, -1).join(sep)
            : cwd()
        this.tsConfigFilePath = tsConfigFilePath
        this.tsProject = new Project({ tsConfigFilePath })
        this.modules = modules
    }

    /**
     * @alias SanProject.compileToSource
     */
    public compile (
        filepathOrComponentClass: string | typeof Component,
        target: string | CompilerClass = 'js',
        options: CompileOptions = {}
    ) {
        return this.compileToSource(filepathOrComponentClass, target, options)
    }
    public compileToSource (
        filepathOrComponentClass: string | typeof Component,
        target: string | CompilerClass = 'js',
        options: CompileOptions = {}
    ) {
        const sanApp = this.parseSanApp(filepathOrComponentClass)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compile(sanApp, options)
    }
    public parseSanApp (
        filepathOrComponentClass: string | typeof Component
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
        filepathOrComponentClass: string | typeof Component,
        options: CompileOptions = {}
    ): Renderer {
        const targetCode = this.compile(filepathOrComponentClass, 'js', {
            ...options,
            bareFunction: true
        })
        const renderer = (new Function('return ' + targetCode))() // eslint-disable-line
        return renderer
    }

    private getOrCreateCompilerInstance (target: string | CompilerClass) {
        const CompilerClass = this.loadCompilerClass(target)

        if (!this.compilers.has(CompilerClass)) {
            this.compilers.set(CompilerClass, new CompilerClass(this))
        }
        return this.compilers.get(CompilerClass)
    }

    private getParser () {
        return new SanAppParser(this.tsProject)
    }

    private loadCompilerClass (target: string | CompilerClass) {
        if (typeof target === 'string') return loadCompilerClassByTarget(target)
        return target
    }
}
