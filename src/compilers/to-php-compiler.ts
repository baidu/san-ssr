import { getInlineDeclarations } from '../parsers/dependency-resolver'
import { isReserved } from '../utils/php-util'
import { ModuleInfo, generatePHPCode } from '../transpilers/ts2php'
import { transformAstToPHP } from '../transformers/to-php'
import { Project } from 'ts-morph'
import { generateComponentRendererSource } from './php-render-compiler'
import { PHPEmitter } from '../emitters/php-emitter'
import { SanApp } from '../parsers/san-app'
import camelCase from 'camelcase'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from '../models/san-sourcefile'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { sep, extname } from 'path'
import debugFactory from 'debug'
import { Compiler } from './compiler'
import { emitRuntimeInPHP } from '../emitters/runtime'

const debug = debugFactory('ast-util')

export type ToPHPCompilerOptions = {
    tsConfigFilePath?: string,
    project: any
    sanssr?: string
}

export class ToPHPCompiler implements Compiler {
    private root: string
    private tsConfigFilePath: string
    private requiredModules: ModuleInfo[]
    private project: Project
    private sanssr: string

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        project,
        sanssr = 'san-ssr'
    }: ToPHPCompilerOptions) {
        this.sanssr = sanssr
        this.project = project
        this.requiredModules = [{
            name: sanssr,
            required: true
        }, {
            name: 'san',
            required: true,
            namespace: '\\san\\runtime\\'
        }]
        this.root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
        this.tsConfigFilePath = tsConfigFilePath
    }

    public compile (sanApp: SanApp, {
        funcName = 'render',
        nsPrefix = 'san\\',
        emitHeader = true
    }) {
        const emitter = new PHPEmitter(emitHeader)
        const ComponentClass = sanApp.getEntryComponentClassOrThrow()

        emitter.beginNamespace(nsPrefix + 'renderer')
        emitter.writeLine(`use ${nsPrefix}runtime\\_;`)
        emitter.writeIndent()
        emitter.writeFunction(funcName, ['$data', '$noDataOutput'], [], () => {
            const renderId = generateComponentRendererSource(emitter, ComponentClass, false, nsPrefix, true)
            emitter.writeLine(`return ${renderId}($data, $noDataOutput);`)
        })
        emitter.endNamespace()

        this.compileComponents(sanApp, emitter, nsPrefix)
        emitRuntimeInPHP(emitter, nsPrefix)
        return emitter.fullText()
    }

    public compileComponent (sourceFile: SanSourceFile, nsPrefix = '') {
        transformAstToPHP(sourceFile, this.sanssr)
        const tsconfig = require(this.tsConfigFilePath)
        const requiredModules = [...this.requiredModules]
        for (const decl of getInlineDeclarations(sourceFile.origin)) {
            const ns = nsPrefix + this.ns(decl.getModuleSpecifierSourceFile().getFilePath())
            const literal = decl.getModuleSpecifierValue()
            requiredModules.push({
                name: literal,
                required: true,
                namespace: '\\' + ns + '\\'
            })
        }
        return generatePHPCode(
            sourceFile.origin,
            requiredModules,
            tsconfig['compilerOptions'],
            nsPrefix
        )
    }

    public compileComponents (entryComp: SanApp, emitter: PHPEmitter = new PHPEmitter(), nsPrefix = '') {
        const registry = new ComponentRegistry()
        for (const [path, sourceFile] of entryComp.getFiles()) {
            registry.registerComponents(sourceFile)

            emitter.beginNamespace(nsPrefix + this.ns(path))
            emitter.writeLine(`use ${nsPrefix}runtime\\_;`)
            emitter.writeLine(`use ${nsPrefix}runtime\\Component;`)
            emitter.writeLines(this.compileComponent(sourceFile, nsPrefix))
            emitter.endNamespace()
        }
        registry.writeComponentRegistry(nsPrefix, path => this.ns(path), emitter)
        return emitter.fullText()
    }

    private ns (file: string) {
        const escapeName = x => isReserved(x) ? 'sanssrNS' + camelCase(x) : x
        return file
            .slice(this.root.length, -extname(file).length)
            .split(sep).map(x => camelCase(x)).map(escapeName).join('\\')
            .replace(/^\\/, '')
    }
}
