import { ClassDeclaration, TypeGuards, Expression, PropertyDeclaration } from 'ts-morph'

export function refactorMemberInitializer (clazz: ClassDeclaration, prop: PropertyDeclaration) {
    const initializer = prop.getInitializer()
    if (!initializer || isConstant(initializer)) return

    if (prop.isStatic()) {
        const statement = clazz.getName() + '.' + prop.getName() + ' = ' + initializer.getFullText()
        clazz.getSourceFile().addStatements(statement)
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

function isConstant (expr: Expression) {
    if (TypeGuards.isLiteralExpression(expr)) return true
    return false
}
