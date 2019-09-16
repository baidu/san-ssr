import { transpileModule } from 'typescript'
import { Project } from 'ts-morph'
import { SanSourceFile } from './san-sourcefile'
import { getDefaultConfigPath } from './tsconfig'
import { sep } from 'path'

export class Compiler {
    private root: string
    private tsconfig: object
    private project: Project

    constructor (
        tsconfigPath = getDefaultConfigPath(),
        root = tsconfigPath.split(sep).slice(0, -1).join(sep)
    ) {
        this.root = root
        this.tsconfig = require(tsconfigPath)
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    compileAndRun (source: SanSourceFile) {
        const js = this.compileToJS(source)
        const fn = new Function('module', 'exports', 'require', js) // eslint-disable-line
        const module = {
            exports: {}
        }
        fn(module, module.exports, require)
        return module.exports
    }

    compileToJS (source: SanSourceFile) {
        const compilerOptions = this.tsconfig['compilerOptions']
        const { diagnostics, outputText } =
            transpileModule(source.sourceFile.getFullText(), { compilerOptions })
        if (diagnostics.length) {
            console.log(diagnostics)
            throw new Error('typescript compile error')
        }
        return outputText
    }
}
