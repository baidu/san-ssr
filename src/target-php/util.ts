import { SourceFile, ClassDeclaration, TypeGuards, Expression, PropertyDeclaration } from 'ts-morph'

const reservedNames = [/^list$/i]

export function isObjectLiteralExpression (expr: Expression) {
    if (TypeGuards.isObjectLiteralExpression(expr)) return true
    if (TypeGuards.isAsExpression(expr) && TypeGuards.isObjectLiteralExpression(expr.getExpression())) return true
    return false
}

export function removeObjectLiteralInitiator (sourceFile: SourceFile, clazz: ClassDeclaration, prop: PropertyDeclaration) {
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

export function isReserved (name: string) {
    for (const reserved of reservedNames) {
        if (reserved.test(name)) return true
    }
    return false
}
