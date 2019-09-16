import { ClassDeclaration, ts, SourceFile } from 'ts-morph'

export function getSanImportDeclaration (sourceFile: SourceFile) {
    return sourceFile.getImportDeclaration(
        node => node.getModuleSpecifierValue() === 'san'
    )
}

export function getComponentClassIdentifier (sourceFile): string | undefined {
    const declaration = getSanImportDeclaration(sourceFile)
    if (!declaration) return

    const namedImports = declaration.getNamedImports()
    for (const namedImport of namedImports) {
        const propertyName = namedImport.getText()
        if (propertyName === 'Component') {
            return namedImport.getText()
        }
    }
}

export function isChildClassOf (clazz: ClassDeclaration, parentClass: string) {
    const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
    if (!extendClause) return false

    const typeNode = extendClause.getTypeNodes().find(x => x.getText() === parentClass)
    if (!typeNode) return false

    return true
}
