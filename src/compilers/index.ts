import { sep, extname } from 'path'
import { CommonJS } from '../loaders/common-js'
import { ToJSCompiler } from './to-js-compiler'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { ComponentParser } from '../parsers/component-parser'
import { Project } from 'ts-morph'
import { ToPHPCompiler } from './to-php-compiler'

export type SanProjectOptions = {
    tsConfigFilePath?: string,
    root?: string,
    sanssr?: string
}

export enum Target {
    php = 'php',
    js = 'js'
}

/**
 * A SanProject is a directory of source code,
 * including one or more SanApps.
 */
export class SanProject {
    private root: string
    private tsConfigFilePath: string
    private toJSCompiler: ToJSCompiler
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
        this.toJSCompiler = new ToJSCompiler({ tsConfigFilePath })
    }

    public compile (filepath: string, target: Target, options = {}) {
        const ext = extname(filepath)
        if (ext === '.ts') {
            return this.compileFromTS(filepath, target, options)
        } else if (ext === '.js') {
            return this.compileFromJS(filepath, options)
        }
        throw new Error(`not recognized file extension: ${ext}`)
    }

    public compileFromTS (filepath: string, target: Target, options) {
        const parser = new ComponentParser(this.project)
        const component = parser.parseComponent(filepath)
        const ComponentClass = this.toJSCompiler.evalComponentClass(component)

        if (target === Target.php) {
            const compiler = new ToPHPCompiler({
                sanssr: this.sanssr,
                project: this.project,
                tsConfigFilePath: this.tsConfigFilePath
            })
            return compiler.compileFromTS(filepath, {
                component,
                ComponentClass,
                ...options
            })
        }
    }

    public compileFromJS (filepath: string, options = {}) {
        const ComponentClass = new CommonJS().require(filepath)
        const compiler = new ToPHPCompiler({
            sanssr: this.sanssr,
            project: this.project,
            tsConfigFilePath: this.tsConfigFilePath
        })
        return compiler.compileFromJS(ComponentClass, options)
    }
}
