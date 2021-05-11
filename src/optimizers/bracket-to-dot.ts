import { BinaryExpression, Expression, Statement } from '../ast/renderer-ast-dfn'
import { isLiteral, isBinaryExpression, I } from '../ast/renderer-ast-util'
import { walk } from '../ast/renderer-ast-walker'
import { isValidIdentifier } from '../utils/lang'

/**
 * 把 foo['bar']['coo'] 改成 foo.bar.coo
 */
export function bracketToDot (node: Expression | Statement) {
    for (const expr of walk(node)) {
        if (isBracketNotation(expr) && isLiteral(expr.rhs) && isValidIdentifier(expr.rhs.value)) {
            // 此处要修改 readonly 属性
            (expr as any).op = '.'
            expr.rhs = I(expr.rhs.value)
        }
    }
}

function isBracketNotation (expr: Expression | Statement): expr is BinaryExpression {
    return isBinaryExpression(expr) && expr.op === '[]'
}
