import { Project, ts, SourceFile, TypeGuards, VariableDeclarationKind } from 'ts-morph'
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

    namespace (file) {
        return file
            .slice(this.root.length, -extname(file).length)
            .split(sep).join('\\')
            .replace(/^\\/, '')
            .replace(/\./g, '_')
    }

    concat (files) {
        let code = ''
        for (const [file, content] of files) {
            code += `namespace ${this.namespace(file)} {\n`
            code += content
            code += `}`
        }
        return code
    }

    compileComponent (componentFile) {
        const result = new Map()
        const queue = [componentFile]
        while (queue.length) {
            const filepath = queue.shift()
            const { code, dependencies } = this.compileFile(filepath)
            result.set(filepath, code)
            dependencies.forEach(dep => queue.push(dep))
        }
        return this.concat(result)
    }

    compileFile (filePath) {
        const file = this.project.getSourceFile(filePath)
        const componentClassIdentifier = getAndRemoveComponentClassIdentifier(file)
        normalizeComponentClass(file, componentClassIdentifier)

        const code = this.compileToPHP(file.getFullText())
        const dependencies = []
        return { code, dependencies }

        // const componentClassDefinition = getComponentClassDefinition(file)
        // if (componentClassDefinition) {
        // validateComponentClassDefinition(componentClassDefinition)
        // removeComponentParent(componentClassDefinition)
        // }

        // const exportAssignment = file.getExportAssignment(d => !d.isExportEquals());
        // if (!exportAssignment) {
        // throw new Error('`export default` is missing!' + filePath)
        // }
    }

    compileToPHP (source) {
        const { errors, phpCode } = compile('', {
            source: source,
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
}

function getAndRemoveComponentClassIdentifier (sourceFile) {
    const declaration = sourceFile.getImportDeclaration(
        node => node.getModuleSpecifierValue() === 'san'
    )
    const namedImports = declaration.getNamedImports()
    // const defaul = declaration.getNam
    for (const namedImport of namedImports) {
        const propertyName = namedImport.getText()
        if (propertyName === 'Component') {
            const identifier = namedImport.getText()

            // declaration.

            return identifier
        }
    }
}

function normalizeComponentClass (sourceFile: SourceFile, componentClassIdentifier) {
    for (const clazz of sourceFile.getClasses()) {
        const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
        if (!extendClause) return

        const typeNode = extendClause.getTypeNodes().find(x => x.getText() === componentClassIdentifier)
        if (!typeNode) return

        extendClause.removeExpression(typeNode)
        clazz.rename('SanSSRPHPComponent')
    }
}

function getComponentClassDefinition (sourceFile) {
    const classes = sourceFile.getClasses()
    console.log(classes)
}
