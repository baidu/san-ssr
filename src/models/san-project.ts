import { sep, resolve } from 'path'
import { cwd } from 'process'
import { getDefaultTSConfigPath } from '../parsers/tsconfig'
import { Compiler } from '../models/compiler'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { Modules } from '../loaders/common-js'

export type SanProjectOptions = {
    tsConfigFilePath?: string,
    root?: string,
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
        modules = {},
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
    }: SanProjectOptions = {}) {
        this.root = root
        this.tsConfigFilePath = tsConfigFilePath
        this.tsProject = new Project({ tsConfigFilePath })
        this.modules = modules
    }

    public compile (filepath: string, target: string | CompilerClass, options = {}) {
        const sanApp = this.parseSanApp(filepath)
        const compiler = this.getOrCreateCompilerInstance(target)
        return compiler.compile(sanApp, options)
    }

    public parseSanApp (filepath: string) {
        const parser = new SanAppParser(this.tsProject)
        return parser.parseSanApp(resolve(filepath), this.modules)
    }

    private getOrCreateCompilerInstance (target: string | CompilerClass) {
        const Class = this.loadCompilerClass(target)

        if (!this.compilers.has(Class)) {
            this.compilers.set(Class, new Class({
                project: this.tsProject,
                tsConfigFilePath: this.tsConfigFilePath
            }))
        }
        return this.compilers.get(Class)
    }

    private loadCompilerClass (target: string | CompilerClass) {
        if (typeof target === 'function') return target
        const pluginName = cwd() + '/node_modules/san-ssr-target-' + target
        try {
            const plugin = require(pluginName)
            return plugin.default || plugin
        } catch (e) {
            throw new Error(
                `failed to load "san-ssr-target-${target}": ${e.message}`
            )
        }
    }
}
