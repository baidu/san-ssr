import { sep } from 'path'
import { ToJSCompiler } from '../target-js'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { Compiler } from '../models/compiler'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { ToPHPCompiler } from '../target-php'
import { Target } from './target'

export type SanProjectOptions = {
    tsConfigFilePath?: string,
    root?: string,
    sanssr?: string
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

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
    }: SanProjectOptions = {}) {
        this.root = root
        this.tsConfigFilePath = tsConfigFilePath
        this.project = new Project({ tsConfigFilePath })
    }

    public compile (filepath: string, target: Target, options = {}) {
        const parser = new SanAppParser(this.project)
        const sanApp = parser.parseSanApp(filepath)
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
