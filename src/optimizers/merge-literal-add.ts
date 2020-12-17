import { Expression, Literal, Statement, Identifier, Block, SyntaxNode } from '../ast/renderer-ast-node'
import { L } from '../ast/renderer-ast-factory'
import { isLiteral, isIdentifier, isBlock, isBinaryExpression, isExpressionStatement } from '../ast/renderer-ast-util'
import { walk } from '../ast/renderer-ast-walker'

type HTMLAddEqualLiteral = Statement & { value: { lhs: Identifier, op: '+=', rhs: Literal } }

export function mergeLiteralAdd (node: Expression | Statement): void {
    for (const descendant of walk(node)) {
        if (isBlock(descendant)) doMergeLiteralAdd(descendant)
    }
}

function doMergeLiteralAdd (node: Block) {
    let prev: HTMLAddEqualLiteral | null = null
    const filteredBody = []
    for (const child of node.body) {
        if (isHTMLAddEqualLiteral(child)) {
            if (prev !== null) {
                prev.value.rhs = L(prev.value.rhs.value + child.value.rhs.value)
                continue
            }
            prev = child
        } else {
            prev = null
        }
        filteredBody.push(child)
    }
    node.body = filteredBody
}

function isHTMLAddEqualLiteral (statement: SyntaxNode): statement is HTMLAddEqualLiteral {
    if (!isExpressionStatement(statement)) return false

    const expr = statement.value
    return isBinaryExpression(expr) &&
        isIdentifier(expr.lhs) && expr.lhs.name === 'html' &&
        expr.op === '+=' &&
        isLiteral(expr.rhs)
}
