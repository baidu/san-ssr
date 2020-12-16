import { Expression, Literal, Statement, Identifier, Block, SyntaxNode } from '../ast/syntax-node'
import { isLiteral, isIdentifier, isBlock, isBinaryExpression, isExpressionStatement } from '../ast/syntax-util'
import { walk } from '../ast/syntax-tree-walker'

type HTMLAddEqualLiteral = Statement & { value: { lhs: Identifier, op: '+=', rhs: Literal } }

export function mergeLiteralAdd (node: Expression | Statement): void {
    for (const descendant of walk(node)) {
        if (isBlock(descendant)) doMergeLiteralAdd(descendant)
    }
}

function doMergeLiteralAdd (node: Block) {
    let prevHTMLAddEqualLiteral: HTMLAddEqualLiteral | null = null
    const filteredBody = []
    for (const child of node.body) {
        if (isHTMLAddEqualLiteral(child)) {
            if (prevHTMLAddEqualLiteral !== null) {
                prevHTMLAddEqualLiteral.value.rhs.value += child.value.rhs.value
                continue
            }
            prevHTMLAddEqualLiteral = child
        } else {
            prevHTMLAddEqualLiteral = null
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
