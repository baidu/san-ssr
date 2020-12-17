import { SyntaxKind, SyntaxNode, Block, Identifier, ExpressionStatement, BinaryExpression, Literal } from './renderer-ast-node'

export function isBlock (node: any): node is Block {
    const blocks = [SyntaxKind.If, SyntaxKind.ElseIf, SyntaxKind.Else, SyntaxKind.Foreach, SyntaxKind.FunctionDefinition]
    return isSyntaxNode(node) && blocks.includes(node.kind)
}

export function isSyntaxNode (node: any): node is SyntaxNode {
    return node && Object.prototype.hasOwnProperty.call(node, 'kind')
}

export function isExpressionStatement (node: SyntaxNode): node is ExpressionStatement {
    return node.kind === SyntaxKind.ExpressionStatement
}

export function isBinaryExpression (node: SyntaxNode): node is BinaryExpression {
    return node.kind === SyntaxKind.BinaryExpression
}

export function isIdentifier (node: SyntaxNode): node is Identifier {
    return node.kind === SyntaxKind.Identifier
}

export function isLiteral (node: SyntaxNode): node is Literal {
    return node.kind === SyntaxKind.Literal
}
