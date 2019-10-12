import { Component } from '../parsers/component'
import { JSEmitter } from '../emitters/js-emitter'
import { generateRenderFunction } from './js-render-compiler'
import { ComponentParser } from '../parsers/component-parser'
import { transpileModule } from 'typescript'
import { CMD } from '../loaders/cmd'
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
        emitter.write('module.exports = ')
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitter.writeRuntime()
            const componentClass = new CMD().require(filepath)
            emitter.writeLines(generateRenderFunction(componentClass))
        })

        return emitter.fullText()
    }

    compileFromTS (filepath: string) {
        const emitter = new JSEmitter()
        emitter.write('module.exports = ')
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitter.writeRuntime()
            const parser = new ComponentParser(this.project)
            const component = parser.parseComponent(filepath)
            const componentClass = this.evalComponentClass(component)
            emitter.writeLines(generateRenderFunction(componentClass))
        })
        return emitter.fullText()
    }

    evalComponentClass (component: Component) {
        const cmd = new CMD(filepath => {
            const sourceFile = component.getModule(filepath)
            if (!sourceFile) throw new Error(`file ${filepath} not found`)
            const js = this.compileToJS(sourceFile)
            return js
        })
        return cmd.require(component.getComponentFilepath()).default
    }

    compileToJS (source: SanSourceFile) {
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
