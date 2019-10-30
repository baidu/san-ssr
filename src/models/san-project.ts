import { sep } from 'path'
import { ToJSCompiler } from '../compilers/to-js-compiler'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { SanAppParser } from '../parsers/san-app-parser'
import { Project } from 'ts-morph'
import { ToPHPCompiler } from '../compilers/to-php-compiler'
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
    private sanssr: string

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep),
        sanssr = 'san-ssr'
    }: SanProjectOptions = {}) {
        this.root = root
        this.sanssr = sanssr
        this.tsConfigFilePath = tsConfigFilePath
        this.project = new Project({ tsConfigFilePath })
    }

    public compile (filepath: string, target: Target, options = {}) {
        const parser = new SanAppParser(this.project)
        const sanApp = parser.parseSanApp(filepath)

        const compiler = target === Target.php
            ? new ToPHPCompiler({
                sanssr: this.sanssr,
                project: this.project,
                tsConfigFilePath: this.tsConfigFilePath
            })
            : new ToJSCompiler({
                tsConfigFilePath: this.tsConfigFilePath,
                project: this.project
            })
        return compiler.compile(sanApp, options)
    }
}
