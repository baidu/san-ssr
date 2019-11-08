import { sep } from 'path'
import { ToJSCompiler } from '../target-js'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { Compiler } from '../models/compiler'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { ToPHPCompiler } from '../target-php'
import { Target } from './target'
import { Modules } from '../loaders/common-js'

export type SanProjectOptions = {
    tsConfigFilePath?: string,
    root?: string,
    modules?: Modules
}

/**
 * A SanProject is a directory of source code,
 * including one or more SanApps.
 */
export class SanProject {
    private root: string
    private tsConfigFilePath: string
    private project: Project
    private compilers: Map<Target, Compiler> = new Map()
    private modules: Modules

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        modules = {},
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
    }: SanProjectOptions = {}) {
        this.root = root
        this.tsConfigFilePath = tsConfigFilePath
        this.project = new Project({ tsConfigFilePath })
        this.modules = modules
    }

    public compile (filepath: string, target: Target, options = {}) {
        const parser = new SanAppParser(this.project)
        const sanApp = parser.parseSanApp(filepath, this.modules)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compile(sanApp, options)
    }

    private getOrCreateCompilerInstance (target: Target) {
        if (!this.compilers.has(target)) {
            const Class = this.loadCompilerClass(target)

            this.compilers.set(target, new Class({
                project: this.project,
                tsConfigFilePath: this.tsConfigFilePath
            }))
        }
        return this.compilers.get(target)
    }

    private loadCompilerClass (target: Target) {
        if (target === Target.php) return ToPHPCompiler
        return ToJSCompiler
    }
}
