import { SyntaxKind, SyntaxNode, Block, UnaryOperator, UnaryExpression, NewExpression, VariableDefinition, ReturnStatement, BinaryOperator, If, Null, AssignmentStatement, Statement, Expression, Identifier, ExpressionStatement, BinaryExpression, Literal } from './syntax-node'

export function createHTMLLiteralAppend (html: string) {
    return STATMENT(BINARY(I('html'), '+=', L(html)))
}

export function createHTMLExpressionAppend (expr: Expression) {
    return STATMENT(BINARY(I('html'), '+=', expr))
}

export function createDefaultValue (expr: Expression, value: Expression): Statement {
    return createIfNull(expr, [ASSIGN(expr, value)])
}

export function createIfNotNull (expr: Expression, statements: Statement[]) {
    return new If(BINARY(NULL, '!=', expr), statements)
}

export function createIfNull (expr: Expression, statements: Statement[]) {
    return new If(BINARY(NULL, '==', expr), statements)
}

export function createIfStrictEqual (lhs: Expression, rhs: Expression, statements: Statement[]) {
    return new If(BINARY(lhs, '===', rhs), statements)
}

export function L (val: any) {
    return new Literal(val)
}

export function I (name: string) {
    return new Identifier(name)
}

export const NULL = new Null()

export const CTX_DATA = BINARY(I('ctx'), '.', I('data'))

export function BINARY (lhs: Expression, op: BinaryOperator, rhs: Expression) {
    return new BinaryExpression(lhs, op, rhs)
}

export function UNARY (op: UnaryOperator, val: Expression) {
    return new UnaryExpression(op, val)
}

export function ASSIGN (lhs: Expression, rhs: Expression) {
    return new AssignmentStatement(lhs, rhs)
}

export function RETURN (val: Expression) {
    return new ReturnStatement(val)
}

export function STATMENT (expr: Expression) {
    return new ExpressionStatement(expr)
}

export function DEF (name: string, expr?: Expression) {
    return new VariableDefinition(name, expr)
}

export function NEW (name: Expression, args: Expression[]) {
    return new NewExpression(name, args)
}

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
