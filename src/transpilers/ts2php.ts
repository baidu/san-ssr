import { Project, ts, SyntaxKind } from 'ts-morph'
import camelCase from 'camelcase'
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
        sourceFile.fakeProperties.forEach(prop => prop.remove())
        getSanImportDeclaration(sourceFile.origin).remove()

        for (const clazz of sourceFile.componentClasses.values()) {
            const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
            const typeNode = extendClause.getTypeNodes().find(x => x.getText() === sourceFile.componentClassIdentifier)
            extendClause.removeExpression(typeNode)

            const comps = clazz.getStaticProperty('components')
            if (comps) comps.remove()

            for (const prop of clazz.getProperties()) {
                // refactor static property initializers to separate statements
                // since php doesn't support non trivial static initializers
                // and ts2php cannot
                if (prop.isStatic() && prop.hasInitializer()) {
                    const initializer = prop.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
                    if (!initializer) continue
                    const statement = clazz.getName() + '.' + prop.getName() + ' = ' + initializer.getFullText()
                    sourceFile.origin.addStatements(statement)
                    prop.removeInitializer()
                }
            }
        }
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
