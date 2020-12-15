import { BinaryExpression, Expression, Statement } from '../ast/syntax-node'
import { isLiteral, I, isBinaryExpression } from '../ast/syntax-util'
import { walk } from '../ast/syntax-tree-walker'
import { isValidIdentifier } from '../utils/lang'

export function bracketToDot (node: Expression | Statement) {
    for (const expr of walk(node)) {
        if (isBracketNotation(expr) && isLiteral(expr.rhs) && isValidIdentifier(expr.rhs.value)) {
            expr.op = '.'
            expr.rhs = I(expr.rhs.value)
        }
    }
}

function isBracketNotation (expr: Expression | Statement): expr is BinaryExpression {
    return isBinaryExpression(expr) && expr.op === '[]'
}
