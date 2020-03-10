import { ImportDeclaration, ClassDeclaration, ts, SourceFile } from 'ts-morph'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

export function getSanImportDeclaration (sourceFile: SourceFile): ImportDeclaration | undefined {
    return sourceFile.getImportDeclaration(
        node => node.getModuleSpecifierValue() === 'san'
    )
}

export function getComponentClassIdentifier (sourceFile: SourceFile): string | undefined {
    const declaration = getSanImportDeclaration(sourceFile)
    if (!declaration) return

    const namedImports = declaration.getNamedImports()
    for (const namedImport of namedImports) {
        const name = namedImport.getName()
        if (name !== 'Component') continue

        const alias = namedImport.getAliasNode()
        if (alias) return alias.getText()
        return 'Component'
    }
}

export function isChildClassOf (clazz: ClassDeclaration, parentClass: string) {
    const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
    if (!extendClause) return false

    const typeNode = extendClause.getTypeNodes().find(x => x.getText() === parentClass)
    if (!typeNode) return false

    return true
}
