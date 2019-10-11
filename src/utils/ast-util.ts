import { TypeGuards, Expression, PropertyDeclaration, ClassDeclaration, ts, SourceFile } from 'ts-morph'
import debugFactory from 'debug'

const debug = debugFactory('ast-util')

export function getSanImportDeclaration (sourceFile: SourceFile) {
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

function isObjectLiteralExpression (expr: Expression) {
    if (TypeGuards.isObjectLiteralExpression(expr)) return true
    if (TypeGuards.isAsExpression(expr) && TypeGuards.isObjectLiteralExpression(expr.getExpression())) return true
    return false
}

export function removeObjectLiteralInitiator (sourceFile: SourceFile, clazz: ClassDeclaration, prop: PropertyDeclaration) {
    debug('removeObjectLiteralInitiator', prop.getName())

    const initializer = prop.getInitializer()
    if (!initializer || !isObjectLiteralExpression(initializer)) return

    if (prop.isStatic()) {
        const statement = clazz.getName() + '.' + prop.getName() + ' = ' + initializer.getFullText()
        sourceFile.addStatements(statement)
    } else {
        let statement = 'this.' + prop.getName() + ' = ' + initializer.getFullText()
        if (!clazz.getConstructors().length) {
            clazz.addConstructor()
            statement = 'super()\n' + statement
        }
        const init = clazz.getConstructors()[0]
        init.setBodyText(init.getBodyText() + '\n' + statement)
    }
    prop.removeInitializer()
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
