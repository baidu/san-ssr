import { Project, ts, SourceFile, TypeGuards, VariableDeclarationKind } from 'ts-morph'
import { compile } from 'ts2php'
import { getDefaultConfigPath } from './tsconfig'

function concat (files) {
    let code = ''
    for (const [file, content] of files) {
        code += `namespace ${file} {`
        code += content
        code += `}`
    }
    return code
}

export class Compiler {
    public tsconfigPath: string
    public tsconfig: object
    public project: Project

    constructor (tsconfigPath = getDefaultConfigPath()) {
        this.tsconfigPath = tsconfigPath
        this.tsconfig = require(tsconfigPath)
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
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
        return concat(result)
    }

    compileFile (filePath) {
        const file = this.project.getSourceFile(filePath)
        const componentClassIdentifier = getAndRemoveComponentClassIdentifier(file)
        console.log(componentClassIdentifier)
        console.log(file.getFullText())

        const code = ''
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

    compileToPHP (file) {
        const { errors, phpCode } = compile(file, {
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

function getComponentClassDefinition (sourceFile) {
    const classes = sourceFile.getClasses()
    console.log(classes)
}
