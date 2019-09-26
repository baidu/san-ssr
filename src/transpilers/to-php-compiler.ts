import { ComponentParser } from '../parser/component-parser'
import { generatePHPCode } from '../emitters/generate-php-code'
import { transformAstToPHP } from '../transformers/to-php'
import { ToJSCompiler } from './to-js-compiler'
import { readFileSync } from 'fs'
import { compileRenderFunction } from './php-render-compiler'
import { Compiler } from './compiler'
import { PHPEmitter } from '../emitters/php-emitter'
import { Component } from '../parser/component'
import camelCase from 'camelcase'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from '../parser/san-sourcefile'
import { getDefaultConfigPath } from '../parser/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

export class ToPHPCompiler extends Compiler {
    private root: string
    private tsConfigFilePath: string
    private nsPrefix: string
    private removeExternals: string[]
    private toJSCompiler: ToJSCompiler

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep),
        removeExternals = [],
        nsPrefix = ''
    }) {
        super({ fileHeader: '<?php\n' })
        this.nsPrefix = nsPrefix
        this.removeExternals = ['san-php-ssr', 'san', ...removeExternals]
        this.root = root
        this.tsConfigFilePath = tsConfigFilePath
        this.toJSCompiler = new ToJSCompiler(tsConfigFilePath)
    }

    public compileFromTS (filepath: string, {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    }) {
        const emitter = new PHPEmitter(emitHeader)
        const parser = ComponentParser.createUsingTsconfig(this.tsConfigFilePath)

        const component = parser.parseComponent(filepath)

        const ComponentClass = this.toJSCompiler.compileAndRun(component.getComponentSourceFile())['default']
        compileRenderFunction({ ComponentClass, funcName, emitter, ns })
        this.compileComponents(component, emitter)

        emitter.writeRuntime()
        return emitter.fullText()
    }

    public compileFromJS (filepath: string, {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    }) {
        const emitter = new PHPEmitter(emitHeader)

        const ComponentClass = this.toJSCompiler.run(readFileSync(filepath, 'utf8'))
        compileRenderFunction({ ComponentClass, funcName, emitter, ns })

        emitter.writeRuntime()
        return emitter.fullText()
    }

    public compileToPHP (sourceFile: SanSourceFile) {
        transformAstToPHP(sourceFile)
        const tsconfig = require(this.tsConfigFilePath)
        return generatePHPCode(
            sourceFile,
            this.removeExternals,
            tsconfig['compilerOptions']
        )
    }

    public compileComponents (component: Component, emitter: PHPEmitter = new PHPEmitter()) {
        const registry = new ComponentRegistry()
        for (const [path, sourceFile] of component.getFiles()) {
            registry.registerComponents(sourceFile)

            emitter.beginNamespace(this.ns(path))
            emitter.writeLine('use \\san\\runtime\\_;')
            emitter.writeLine('use \\san\\runtime\\Component;')
            emitter.writeLines(this.compileToPHP(sourceFile))
            emitter.endNamespace()
        }
        registry.writeComponentRegistry(path => this.ns(path), emitter)
        return emitter.fullText()
    }

    private ns (file) {
        let str = file
            .slice(this.root.length, -extname(file).length)
            .split(sep).map(camelCase).join('\\')
            .replace(/^\\/, '')
        if (this.nsPrefix) {
            str = this.nsPrefix + str
        }
        return str
    }
}
