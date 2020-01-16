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

export function movePropertyInitiatorToPrototype (sourceFile: SourceFile, clazz: ClassDeclaration) {
    debug('props', clazz.getProperties())
    for (const prop of clazz.getProperties()) {
        debug('movePropertyInitiatorToPrototype', prop.getName())
        const initializer = prop.getInitializer()
        if (!initializer || prop.isStatic()) continue
        const statement = clazz.getName() + '.prototype.' + prop.getName() + ' = ' + initializer.getFullText()
        sourceFile.addStatements(statement)
        prop.removeInitializer()
    }
}
