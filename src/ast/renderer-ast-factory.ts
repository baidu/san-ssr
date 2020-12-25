import { MapLiteral, UnaryOperator, UnaryExpression, NewExpression, VariableDefinition, ReturnStatement, BinaryOperator, If, Null, AssignmentStatement, Statement, Expression, Identifier, ExpressionStatement, BinaryExpression, Literal } from './renderer-ast-node'

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

export function L (val: any) {
    return Literal.create(val)
}

export function I (name: string) {
    return Identifier.create(name)
}

export const NULL = Null.create()

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

export function NEW (name: Expression, args: Expression[]) {
    return new NewExpression(name, args)
}

export const EMPTY_MAP = new MapLiteral([])
