import { Expression, SyntaxKind } from '../../src/ast/syntax-node'

export function matchHTMLAddEqual (expr: Expression) {
    return expect.objectContaining({
        kind: SyntaxKind.ExpressionStatement,
        value: expect.objectContaining({
            kind: SyntaxKind.BinaryExpression,
            lhs: {
                kind: SyntaxKind.Identifier,
                name: 'html'
            },
            op: '+=',
            rhs: expr
        })
    })
}
