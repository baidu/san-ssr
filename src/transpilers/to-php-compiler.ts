import { ComponentParser } from '../parser/component-parser'
import { ToJSCompiler } from './to-js-compiler'
import { readFileSync } from 'fs'
import { compileRenderFunction } from './php-render-compiler'
import { Compiler } from './compiler'
import { Project } from 'ts-morph'
import { PHPEmitter } from '../emitters/php-emitter'
import { Component } from '../parser/component'
import camelCase from 'camelcase'
import { removeObjectLiteralInitiator } from '../parser/ast-util'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from '../parser/san-sourcefile'
import { compile } from 'ts2php'
import { getDefaultConfigPath } from '../parser/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')
const reservedNames = ['List']
const uselessProps = ['components']

export class ToPHPCompiler extends Compiler {
    private root: string
    private tsconfig: object
    private project: Project
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
        this.tsconfig = require(tsConfigFilePath)
        this.project = new Project({
            tsConfigFilePath: tsConfigFilePath
        })
        this.toJSCompiler = new ToJSCompiler(tsConfigFilePath)
    }

    public compileFromTS (filepath: string, {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    }) {
        const emitter = new PHPEmitter(emitHeader)
        const parser = new ComponentParser(this.project)

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
        this.transform(sourceFile)
        return this.doCompile(sourceFile)
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

    private transform (sourceFile: SanSourceFile) {
        sourceFile.fakeProperties.forEach(prop => prop.remove())

        for (const clazz of sourceFile.componentClasses.values()) {
            for (const useless of uselessProps) {
                const comps = clazz.getStaticProperty(useless)
                if (comps) comps.remove()
            }

            for (const prop of clazz.getProperties()) {
                removeObjectLiteralInitiator(sourceFile.origin, clazz, prop)
            }
        }

        for (const clazz of sourceFile.getClasses()) {
            const name = clazz.getName()
            if (reservedNames.includes(name)) {
                if (clazz.isExported()) {
                    throw new Error(`${name} is a reserved keyword in PHP`)
                }
                clazz.rename(`SpsrClass${name}`)
            }
        }
    }

    private doCompile (sourceFile: SanSourceFile) {
        const modules = {}
        for (const name of this.removeExternals) {
            modules[name] = { name, required: true }
        }
        const { errors, phpCode } = compile(sourceFile.getFilePath(), {
            source: sourceFile.getFullText(),
            emitHeader: false,
            plugins: [],
            modules,
            helperClass: '\\san\\runtime\\Ts2Php_Helper',
            compilerOptions: this.tsconfig['compilerOptions']
        })
        if (errors.length) {
            const error = errors[0]
            throw new Error(error.msg || error['messageText'])
        }
        return phpCode
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
