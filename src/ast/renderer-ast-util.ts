/**
 * Renderer AST 的工具库
 *
 * 这里维护操作 Renderer AST 的工具，尤其是方便创建 AST。
 * 例如：new AssignmentStatement(new Identifier('html'), new Literal('foo')) 可以简写为 ASSIGN(I('html), L('foo))
 */

import {
    SyntaxKind,
    SyntaxNode,
    Block,
    MapLiteral,
    UnaryOperator,
    UnaryExpression,
    NewExpression,
    VariableDefinition,
    ReturnStatement,
    BinaryOperator,
    If,
    Null,
    Undefined,
    AssignmentStatement,
    Statement,
    Expression,
    Identifier,
    ExpressionStatement,
    BinaryExpression,
    Literal,
    TryStatement,
    CatchClause,
    ConditionalExpression,
    FunctionCall,
    FunctionDefinition
} from './renderer-ast-dfn'

export function createHTMLLiteralAppend (html: string) {
    return STATEMENT(BINARY(I('html'), '+=', L(html)))
}

export function createHTMLExpressionAppend (expr: Expression) {
    return STATEMENT(BINARY(I('html'), '+=', expr))
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

export function createTryStatement (block: Statement[], param: Identifier, body: Statement[]) {
    return new TryStatement(block, new CatchClause(param, body))
}

export function createDefineWithDefaultValue (varName: string, value: Expression, defaultValue: Expression) {
    return DEF(varName, new ConditionalExpression(BINARY(value, '==', NULL), defaultValue, value))
}

export function L (val: any) {
    return Literal.create(val)
}

export function I (name: string) {
    return Identifier.create(name)
}

export const NULL = Null.create()

export const UNDEFINED = Undefined.create()

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

export function STATEMENT (expr: Expression) {
    return new ExpressionStatement(expr)
}

export function DEF (name: string, expr?: Expression) {
    return new VariableDefinition(name, expr)
}
export function IIFE (body: Statement[]) {
    return new FunctionCall(
        new UnaryExpression(
            '()',
            new FunctionDefinition('', [], body)
        ),
        []
    )
}

export function NEW (name: Expression, args: Expression[]) {
    return new NewExpression(name, args)
}

export const EMPTY_MAP = new MapLiteral([])

export function isBlock (node: any): node is Block {
    const blocks = [
        SyntaxKind.If, SyntaxKind.ElseIf, SyntaxKind.Else, SyntaxKind.Foreach, SyntaxKind.FunctionDefinition,
        SyntaxKind.SlotRendererDefinition
    ]
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
