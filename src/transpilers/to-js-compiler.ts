import { transpileModule } from 'typescript'
import { Module } from '../runners/cmd'
import { Project } from 'ts-morph'
import { movePropertyInitiatorToPrototype } from '../parser/ast-util'
import { SanSourceFile } from '../parser/san-sourcefile'
import { getDefaultConfigPath } from '../parser/tsconfig'
import { Compiler } from './compiler'
import { sep } from 'path'
import debugFactory from 'debug'

const debug = debugFactory('to-js-compiler')

export class ToJSCompiler extends Compiler {
    private root: string
    private tsconfig: object
    private project: Project

    constructor (
        tsconfigPath = getDefaultConfigPath(),
        root = tsconfigPath.split(sep).slice(0, -1).join(sep)
    ) {
        super()
        this.root = root
        this.tsconfig = require(tsconfigPath)
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    compileAndRun (source: SanSourceFile) {
        const js = this.compileToJS(source)
        return this.run(js)
    }

    run (js: string) {
        Module.cache.delete(__filename)
        return Module.require(__filename, js)
    }

    private transform (sourceFile: SanSourceFile) {
        for (const clazz of sourceFile.getComponentClassNames()) {
            movePropertyInitiatorToPrototype(sourceFile.origin, sourceFile.getClass(clazz))
        }
    }

    compileToJS (source: SanSourceFile) {
        // source = source.openInProject(this.project)
        // this.transform(source)
        const compilerOptions = this.tsconfig['compilerOptions']
        const { diagnostics, outputText } =
            transpileModule(source.getFullText(), { compilerOptions })
        if (diagnostics.length) {
            console.log(diagnostics)
            throw new Error('typescript compile error')
        }
        return outputText
    }
}
