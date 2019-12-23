import { sep, resolve } from 'path'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import { cwd } from 'process'
import { Compiler } from '../models/compiler'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { Modules } from '../loaders/common-js'
import { loadCompilerClassByTarget } from '../loaders/target'

export type SanProjectOptions = {
    tsConfigFilePath?: string,
    modules?: Modules
}

type CompilerClass = Partial<{ new(): Compiler}>

/**
 * A SanProject is a directory of source code,
 * including one or more SanApps.
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

    public compile (filepath: string, target: string | CompilerClass = 'js', options = {}) {
        const sanApp = this.parseSanApp(filepath)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compile(sanApp, options)
    }

    public parseSanApp (filepath: string) {
        return this.getParser().parseSanApp(resolve(filepath), this.modules)
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
