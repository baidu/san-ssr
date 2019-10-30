import { SanApp } from '../parsers/san-app'
import { JSEmitter } from '../emitters/js-emitter'
import { generateRenderFunction } from './js-render-compiler'
import { ComponentParser } from '../parsers/component-parser'
import { transpileModule } from 'typescript'
import { CommonJS } from '../loaders/common-js'
import { Project } from 'ts-morph'
import { SanSourceFile } from '../parsers/san-sourcefile'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'
import { Compiler } from './compiler'
import { emitRuntimeInJS } from '../emitters/runtime'

const debug = debugFactory('to-js-compiler')

export type ToJSCompilerOptions = {
    tsConfigFilePath?: string,
    root?: string
}

export class ToJSCompiler implements Compiler {
    private root: string
    private tsConfigFilePath: object
    private project: Project

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
    }: ToJSCompilerOptions = {}) {
        this.root = root
        this.tsConfigFilePath = require(tsConfigFilePath)
        this.project = new Project({
            tsConfigFilePath: tsConfigFilePath
        })
    }

    public compile (filepath: string) {
        const ext = extname(filepath)
        if (ext === '.ts') {
            return this.compileFromTS(filepath)
        } else if (ext === '.js') {
            return this.compileFromJS(filepath)
        }
        throw new Error(`not recognized file extension: ${ext}`)
    }

    public compileFromJS (filepath: string) {
        const emitter = new JSEmitter()
        emitter.write('module.exports = ')
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitRuntimeInJS(emitter)
            const componentClass = new CommonJS().require(filepath)
            emitter.writeLines(generateRenderFunction(componentClass))
        })

        return emitter.fullText()
    }

    public compileFromTS (filepath: string) {
        const emitter = new JSEmitter()
        emitter.write('module.exports = ')
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitRuntimeInJS(emitter)
            const parser = new ComponentParser(this.project)
            const component = parser.parseComponent(filepath)
            const componentClass = this.evalComponentClass(component)
            emitter.writeLines(generateRenderFunction(componentClass))
        })
        return emitter.fullText()
    }

    public evalComponentClass (component: SanApp) {
        const commonJS = new CommonJS(filepath => {
            const sourceFile = component.getFile(filepath)
            if (!sourceFile) throw new Error(`file ${filepath} not found`)
            const js = this.compileToJS(sourceFile)
            return js
        })
        return commonJS.require(component.getComponentFilepath()).default
    }

    public compileToJS (source: SanSourceFile) {
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
