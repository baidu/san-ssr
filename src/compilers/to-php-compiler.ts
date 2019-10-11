import { CMD } from '../loaders/cmd'
import { ComponentParser } from '../parsers/component-parser'
import { getInlineDependencyLiterals } from '../parsers/dependency-resolver'
import { isReserved } from '../utils/php-util'
import { generatePHPCode } from '../emitters/generate-php-code'
import { transformAstToPHP } from '../transformers/to-php'
import { ToJSCompiler } from './to-js-compiler'
import { Project } from 'ts-morph'
import { compileRenderFunction } from './php-render-compiler'
import { Compiler } from './compiler'
import { PHPEmitter } from '../emitters/php-emitter'
import { Component } from '../parsers/component'
import camelCase from 'camelcase'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from '../parsers/san-sourcefile'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

export class ToPHPCompiler extends Compiler {
    private root: string
    private tsConfigFilePath: string
    private nsPrefix: string
    private skipRequire: string[]
    private toJSCompiler: ToJSCompiler
    private project: Project

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        root = tsConfigFilePath.split(sep).slice(0, -1).join(sep),
        skipRequire = [],
        nsPrefix = ''
    }) {
        super({ fileHeader: '<?php\n' })
        this.nsPrefix = nsPrefix
        this.skipRequire = ['san-php-ssr', 'san', ...skipRequire]
        this.root = root
        this.tsConfigFilePath = tsConfigFilePath
        this.project = new Project({ tsConfigFilePath })
        this.toJSCompiler = new ToJSCompiler(tsConfigFilePath)
    }

    public compileFromTS (filepath: string, {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    } = {}) {
        const emitter = new PHPEmitter(emitHeader)
        const parser = new ComponentParser(this.project)
        const component = parser.parseComponent(filepath)
        const ComponentClass = this.toJSCompiler.evalComponentClass(component)

        compileRenderFunction({ ComponentClass, funcName, emitter, ns })
        this.compileComponents(component, emitter)

        emitter.writeRuntime()
        return emitter.fullText()
    }

    public compileFromJS (filepath: string, {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    } = {}) {
        const emitter = new PHPEmitter(emitHeader)

        const ComponentClass = new CMD().require(filepath)
        compileRenderFunction({ ComponentClass, funcName, emitter, ns })

        emitter.writeRuntime()
        return emitter.fullText()
    }

    public compileToPHP (sourceFile: SanSourceFile) {
        transformAstToPHP(sourceFile)
        const tsconfig = require(this.tsConfigFilePath)

        return generatePHPCode(
            sourceFile,
            [...this.skipRequire, ...getInlineDependencyLiterals(sourceFile.origin)],
            tsconfig['compilerOptions']
        )
    }

    public compileComponents (entryComp: Component, emitter: PHPEmitter = new PHPEmitter()) {
        const registry = new ComponentRegistry()
        for (const [path, sourceFile] of entryComp.getFiles()) {
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
        const escapeName = x => isReserved(x) ? 'spsrNS' + camelCase(x) : x
        let str = file
            .slice(this.root.length, -extname(file).length)
            .split(sep).map(camelCase).map(escapeName).join('\\')
            .replace(/^\\/, '')
        if (this.nsPrefix) {
            str = this.nsPrefix + str
        }
        return str
    }
}
