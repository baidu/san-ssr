import { compileToSource as writeRenderFunction } from '../php-ssr'
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
    private tsconfigPath: string
    private tsconfig: object
    private project: Project
    private nsPrefix: string

    constructor ({
        tsconfigPath = getDefaultConfigPath(),
        root = tsconfigPath.split(sep).slice(0, -1).join(sep),
        nsPrefix = ''
    }) {
        super({ fileHeader: '<?php\n' })
        this.nsPrefix = nsPrefix
        this.root = root
        this.tsconfigPath = tsconfigPath
        this.tsconfig = require(tsconfigPath)
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    public compileToPHP (sourceFile: SanSourceFile) {
        this.transform(sourceFile)
        return this.doCompile(sourceFile)
    }

    compileComponent (component: Component, ComponentClass, emitter: PHPEmitter = new PHPEmitter(), {
        funcName = 'render',
        ns = 'san\\renderer',
        emitHeader = true
    }) {
        if (emitHeader) this.writeFileHeader(emitter)
        this.transpileFiles(component, emitter)
        writeRenderFunction({ ComponentClass, funcName, emitter, ns })
        emitter.writeRuntime()

        return emitter.fullText()
    }

    public transpileFiles (component: Component, emitter: PHPEmitter = new PHPEmitter()) {
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
        const { errors, phpCode } = compile(sourceFile.getFilePath(), {
            source: sourceFile.getFullText(),
            emitHeader: false,
            plugins: [],
            modules: {
                san: {
                    name: 'san',
                    required: true
                },
                // TODO make it configurable by test scripts
                '../../..': {
                    name: 'san-ssr-php',
                    required: true
                },
                'san-ssr-php': {
                    name: 'san-ssr-php',
                    required: true
                }
            },
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
