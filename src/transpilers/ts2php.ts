import { Project } from 'ts-morph'
import { Component } from '../parser/component'
import camelCase from 'camelcase'
import { shimObjectLiteralInitiator } from '../parser/ast-util'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from '../parser/san-sourcefile'
import { compile } from 'ts2php'
import { getDefaultConfigPath } from '../parser/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

export class Compiler {
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
        this.nsPrefix = nsPrefix
        this.root = root
        this.tsconfigPath = tsconfigPath
        this.tsconfig = require(tsconfigPath)
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    compileToPHP (sourceFile: SanSourceFile) {
        this.transform(sourceFile)
        return this.doCompile(sourceFile)
    }

    compileComponent (component: Component) {
        const registry = new ComponentRegistry()
        let code = ''
        for (const [path, sourceFile] of component.getFiles()) {
            registry.registerComponents(sourceFile)
            code += `namespace ${this.ns(path)} {\n`
            code += `    use \\san\\runtime\\_;\n`
            code += `    use \\san\\runtime\\Component;\n`
            code += `    ${this.compileToPHP(sourceFile)}\n`
            code += '}\n'
        }
        code += registry.genComponentRegistry(path => this.ns(path))
        return code
    }

    private transform (sourceFile: SanSourceFile) {
        sourceFile.fakeProperties.forEach(prop => prop.remove())

        for (const clazz of sourceFile.componentClasses.values()) {
            const comps = clazz.getStaticProperty('components')
            if (comps) comps.remove()

            for (const prop of clazz.getProperties()) {
                const name = prop.getName()

                if (name === 'filters' || name === 'computed') {
                    if (!prop.isStatic()) prop.setIsStatic(true)
                }
                shimObjectLiteralInitiator(sourceFile.origin, clazz, prop)
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
