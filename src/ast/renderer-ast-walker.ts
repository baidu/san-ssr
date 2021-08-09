/**
 * Renderer AST 遍历器
 *
 * 用来遍历 Renderer 里的每一个节点，方便做查找、移除等逻辑
 */

import { Statement, SyntaxKind, Expression } from './renderer-ast-dfn'
import { assertNever } from '../utils/lang'

export function * walk (node: Expression | Statement): Iterable<Expression | Statement> {
    yield node
    switch (node.kind) {
    case SyntaxKind.JSONStringify:
    case SyntaxKind.UnaryExpression:
    case SyntaxKind.ComponentRendererReference:
    case SyntaxKind.EncodeURIComponent:
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.ExpressionStatement:
        yield * walk(node.value)
        break
    case SyntaxKind.Literal:
    case SyntaxKind.Identifier:
    case SyntaxKind.CreateComponentInstance:
    case SyntaxKind.Null:
    case SyntaxKind.Undefined:
    case SyntaxKind.ImportHelper:
    case SyntaxKind.ComputedCall:
    case SyntaxKind.ComponentReferenceLiteral:
        break
    case SyntaxKind.ArrayIncludes:
        yield * walk(node.arr)
        yield * walk(node.item)
        break
    case SyntaxKind.MapAssign:
        yield * walk(node.dest)
        for (const src of node.srcs) yield * walk(src)
        break
    case SyntaxKind.RegexpReplace:
        yield * walk(node.original)
        yield * walk(node.replacement)
        break
    case SyntaxKind.ConditionalExpression:
        yield * walk(node.cond)
        yield * walk(node.falseValue)
        yield * walk(node.trueValue)
        break
    case SyntaxKind.FilterCall:
    case SyntaxKind.GetRootCtxCall:
    case SyntaxKind.HelperCall:
        for (const arg of node.args) yield * walk(arg)
        break
    case SyntaxKind.FunctionDefinition:
    case SyntaxKind.SlotRendererDefinition:
        for (const arg of node.args) yield * walk(arg)
        for (const stmt of node.body) yield * walk(stmt)
        break
    case SyntaxKind.FunctionCall:
    case SyntaxKind.SlotRenderCall:
        for (const arg of node.args) yield * walk(arg)
        yield * walk(node.fn)
        break
    case SyntaxKind.NewExpression:
        for (const arg of node.args) yield * walk(arg)
        yield * walk(node.name)
        break
    case SyntaxKind.ArrayLiteral:
        for (const [expr] of node.items) yield * walk(expr)
        break
    case SyntaxKind.MapLiteral:
        for (const [key, val] of node.items) {
            yield * walk(key)
            yield * walk(val)
        }
        break
    case SyntaxKind.AssignmentStatement:
    case SyntaxKind.BinaryExpression:
        yield * walk(node.lhs)
        yield * walk(node.rhs)
        break
    case SyntaxKind.VariableDefinition:
        if (node.initial) yield * walk(node.initial)
        break
    case SyntaxKind.If:
    case SyntaxKind.ElseIf:
        yield * walk(node.cond)
        for (const stmt of node.body) yield * walk(stmt)
        break
    case SyntaxKind.Else:
        for (const stmt of node.body) yield * walk(stmt)
        break
    case SyntaxKind.Foreach:
        yield * walk(node.key)
        yield * walk(node.value)
        yield * walk(node.iterable)
        for (const stmt of node.body) yield * walk(stmt)
        break
    case SyntaxKind.TryStatement:
        for (const stmt of node.block) yield * walk(stmt)
        yield * walk(node.handler.param)
        for (const stmt of node.handler.body) yield * walk(stmt)
        break
    default: assertNever(node)
    }
}
