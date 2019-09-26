import { readFileSync } from 'fs'
import { JSEmitter } from '../emitters/js-emitter'
import { compileToSource } from './js-render-compiler'
import { ComponentParser } from '../parsers/component-parser'
import { transpileModule } from 'typescript'
import { Module } from '../loaders/cmd'
import { Project } from 'ts-morph'
import { SanSourceFile } from '../parsers/san-sourcefile'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { Compiler } from './compiler'
import { sep } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('to-js-compiler')

export class ToJSCompiler extends Compiler {
    private root: string
    private tsConfigFilePath: object
    private project: Project

    constructor (
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
    ) {
        super()
        this.root = root
        this.tsConfigFilePath = require(tsConfigFilePath)
        this.project = new Project({
            tsConfigFilePath: tsConfigFilePath
        })
    }

    compileFromJS (filepath: string) {
        const emitter = new JSEmitter()
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitter.writeRuntime()
            const componentClass = this.run(readFileSync(filepath, 'utf8'))
            emitter.writeLines(compileToSource(componentClass))
        })

        return emitter.fullText()
    }

    compileFromTS (filepath: string) {
        const emitter = new JSEmitter()
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitter.writeRuntime()
            const parser = new ComponentParser(this.project)
            const component = parser.parseComponent(filepath)
            const componentClass = this.compileAndRun(component.getComponentSourceFile())['default']
            emitter.writeLines(compileToSource(componentClass))
        })
        return emitter.fullText()
    }

    compileAndRun (source: SanSourceFile) {
        const js = this.compileToJS(source)
        return this.run(js)
    }

    run (js: string) {
        Module.cache.delete(__filename)
        return Module.require(__filename, js)
    }

    compileToJS (source: SanSourceFile) {
        // source = source.openInProject(this.project)
        // this.transform(source)
        const compilerOptions = this.tsConfigFilePath['compilerOptions']
        const { diagnostics, outputText } =
            transpileModule(source.getFullText(), { compilerOptions })
        if (diagnostics.length) {
            console.log(diagnostics)
            throw new Error('typescript compile error')
        }
        return outputText
    }
}
