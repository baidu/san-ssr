import { Project, ts } from 'ts-morph'
import { getSanImportDeclaration } from './ast-util'
import { ComponentRegistry } from './component-registry'
import { SanSourceFile } from './san-sourcefile'
import { compile } from 'ts2php'
import { getDefaultConfigPath } from './tsconfig'
import { sep, extname } from 'path'

export class Compiler {
    private root: string
    private tsconfigPath: string
    private tsconfig: object
    private project: Project

    constructor (
        tsconfigPath = getDefaultConfigPath(),
        root = tsconfigPath.split(sep).slice(0, -1).join(sep)
    ) {
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

    compileComponent (files: Map<string, SanSourceFile>) {
        const registry = new ComponentRegistry()
        let code = ''
        for (const [path, sourceFile] of files) {
            registry.registerComponents(sourceFile)
            code += `namespace ${this.ns(path)} {\n`
            code += `    ${this.compileToPHP(sourceFile)}\n`
            code += '}\n'
        }
        code += registry.genComponentRegistry(path => this.ns(path))
        return code
    }

    private transform (sourceFile: SanSourceFile) {
        for (const clazz of sourceFile.componentClasses.values()) {
            const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
            const typeNode = extendClause.getTypeNodes().find(x => x.getText() === sourceFile.componentClassIdentifier)

            extendClause.removeExpression(typeNode)
        }
        sourceFile.fakeProperties.forEach(prop => prop.remove())
        getSanImportDeclaration(sourceFile.origin).remove()
    }

    private doCompile (sourceFile: SanSourceFile) {
        const { errors, phpCode } = compile('', {
            source: sourceFile.getFullText(),
            emitHeader: false,
            plugins: [],
            compilerOptions: this.tsconfig['compilerOptions']
        })
        if (errors.length) {
            const error = errors[0]
            throw new Error(error.msg || error['messageText'])
        }
        return phpCode
    }

    private ns (file) {
        return file
            .slice(this.root.length, -extname(file).length)
            .split(sep).join('\\')
            .replace(/^\\/, '')
            .replace(/\./g, '_')
    }
}
