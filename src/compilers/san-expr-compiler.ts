/**
 * 从 San Expr 生成 renderer AST
 *
 * template 的 ANode 树中，包含很多表达式（San Expr），
 * 它们控制了 Element 类型的 ANode 如何渲染。
 * 现在需要把这些表达式转换为 renderer 函数里的表达式（renderer AST 形式）。
 */
import { ExprStringNode, ExprNode, ExprTertiaryNode, ExprBinaryNode, ExprUnaryNode, ExprInterpNode, ExprAccessorNode, ExprCallNode, ExprTextNode, ExprObjectNode, ExprArrayNode } from 'san'
import * as TypeGuards from '../ast/san-ast-type-guards'
import { _ } from '../runtime/underscore'
import { EncodeURIComponent, MapLiteral, HelperCall, ArrayLiteral, FilterCall, FunctionCall, Identifier, ConditionalExpression, BinaryExpression, UnaryExpression, Expression } from '../ast/renderer-ast-dfn'
import { CTX_DATA, L, I, NULL } from '../ast/renderer-ast-util'

// 输出类型
export enum OutputType {
    /*
     * 直出
     */
    NONE = 0,
    /*
     * 需要对值进行 HTML 转义，可能用于表达式里，比如 `callSlot(expr)`
     */
    ESCAPE = 1,
    /*
     * 需要拼接到 HTML：undefined/null 转为 ''，比如 `html += "&lt;"`
     *
     * 不能封装到 html+= 处，因为可能用于表达式里，比如 `{{ foo }}bar` 编译为：
     * `output(data('foo'), true) + "bar"`
     * 注意每个部分都需要转义，但最终结果不一定直接用于 html +=
     */
    HTML = 2,
    /*
     * 需要转义，也需要拼接到 HTML ，比如 `html += output(expr, true)`
     */
    ESCAPE_HTML = 3,
}

// 二元表达式操作符映射表
const binaryOp = {
    37: '%',
    43: '+',
    45: '-',
    42: '*',
    47: '/',
    60: '<',
    62: '>',
    76: '&&',
    94: '!=',
    121: '<=',
    122: '==',
    123: '>=',
    155: '!==',
    183: '===',
    248: '||'
}

function unary (e: ExprUnaryNode) {
    if (e.operator === 33) return new UnaryExpression('!', sanExpr(e.expr))
    if (e.operator === 45) return new UnaryExpression('-', sanExpr(e.expr))
    if (e.operator === 43) return new UnaryExpression('+', sanExpr(e.expr))
    throw new Error(`unexpected unary operator "${String.fromCharCode(e.operator)}"`)
}
function binary (e: ExprBinaryNode, output: OutputType) {
    const lhs = sanExpr(e.segs[0], output)
    const op = binaryOp[e.operator]
    const rhs = sanExpr(e.segs[1], output)
    return new BinaryExpression(lhs, op, rhs)
}
function tertiary (e: ExprTertiaryNode, output: OutputType) {
    return new ConditionalExpression(sanExpr(e.segs[0]), sanExpr(e.segs[1], output), sanExpr(e.segs[2], output))
}

// 生成数据访问表达式代码
export function dataAccess (accessorExpr: ExprAccessorNode, outputType: OutputType) {
    let data = CTX_DATA
    for (const path of accessorExpr.paths) {
        data = new BinaryExpression(data, '[]', sanExpr(path))
    }
    return outputCode(data, outputType)
}

// 生成调用表达式代码
function callExpr (callExpr: ExprCallNode, outputType: OutputType) {
    const paths = callExpr.name.paths
    let fn = new BinaryExpression(I('ctx'), '.', I('instance'))
    fn = new BinaryExpression(fn, '.', I(paths.shift()!.value))
    for (const path of paths) {
        fn = new BinaryExpression(fn, '[]', sanExpr(path))
    }
    return outputCode(new FunctionCall(fn, callExpr.args.map(arg => sanExpr(arg))), outputType)
}

function outputCode (expr: Expression, outputType: OutputType) {
    const needEscape = Boolean(outputType & OutputType.ESCAPE)
    if (outputType & OutputType.HTML) {
        return new HelperCall('output', [expr, L(needEscape)])
    }
    return needEscape ? new HelperCall('escapeHTML', [expr]) : expr
}

// 生成插值代码
function interp (interpExpr: ExprInterpNode, outputType: OutputType) {
    let code = sanExpr(interpExpr.expr)

    for (const filter of interpExpr.filters) {
        const filterName = filter.name.paths[0].value

        if (['_style', '_class', '_xstyle', '_xclass'].includes(filterName)) {
            code = new HelperCall(filterName.slice(1) + 'Filter' as any, [code, ...filter.args.map(arg => sanExpr(arg, OutputType.NONE))])
        } else if (filterName === 'url') {
            code = new EncodeURIComponent(code)
        } else {
            code = new FilterCall(filterName, [code, ...filter.args.map(arg => sanExpr(arg, OutputType.NONE))])
        }
    }
    // {{ | raw }}
    if (interpExpr.original) outputType &= ~OutputType.ESCAPE
    return outputCode(code, outputType)
}

function str (e: ExprStringNode, output: OutputType) {
    return L(output & OutputType.ESCAPE ? _.escapeHTML(e.value) : e.value)
}

// 生成文本片段代码
function text (textExpr: ExprTextNode, output: OutputType) {
    if (!textExpr.segs.length) return L('')
    return textExpr.segs.map(seg => sanExpr(seg, output)).reduce((prev, curr) => new BinaryExpression(prev, '+', curr))
}

// 生成数组字面量代码
function array (arrayExpr: ExprArrayNode) {
    return new ArrayLiteral(arrayExpr.items.map(e => [sanExpr(e.expr), e.spread]))
}

// 生成对象字面量代码
function object (objExpr: ExprObjectNode) {
    return new MapLiteral(objExpr.items.map(item => [
        (item.name ? sanExpr(item.name) : sanExpr(item.expr)) as Identifier,
        sanExpr(item.expr),
        item.spread
    ]))
}

/**
 * expr 对应的 AST 表达式
 *
 * 注意：我们总是把 output 参数往下传递，而非在最外层把结果去做 escape。
 * 这是为了让编译后的代码更高效，因为只有叶结点才最清楚这个结点能否在编译期 escape，例如：
 *
 * {{ "<" }} // 对应的表达式为 InterpNode{ LiteralNode }
 *
 * - 我们让内层的 LiteralNode 来处理自己的转义，直接输出 "&lt;"
 * - 如果让 InterpNode 来处理，输出则是 "_.output("<", true)"
 */
export function sanExpr (e: ExprNode, output: OutputType = OutputType.NONE): Expression {
    let s

    if (TypeGuards.isExprUnaryNode(e)) s = unary(e)
    else if (TypeGuards.isExprBinaryNode(e)) s = binary(e, output)
    else if (TypeGuards.isExprTertiaryNode(e)) s = tertiary(e, output)
    else if (TypeGuards.isExprStringNode(e)) s = str(e, output)
    else if (TypeGuards.isExprNumberNode(e)) s = L(e.value)
    else if (TypeGuards.isExprBoolNode(e)) s = L(!!e.value)
    else if (TypeGuards.isExprAccessorNode(e)) s = dataAccess(e, output)
    else if (TypeGuards.isExprInterpNode(e)) s = interp(e, output)
    else if (TypeGuards.isExprTextNode(e)) s = text(e, output)
    else if (TypeGuards.isExprArrayNode(e)) s = array(e)
    else if (TypeGuards.isExprObjectNode(e)) s = object(e)
    else if (TypeGuards.isExprCallNode(e)) s = callExpr(e, output)
    else if (TypeGuards.isExprNullNode(e)) s = NULL
    else throw new Error(`unexpected expression ${JSON.stringify(e)}`)

    return e.parenthesized ? new UnaryExpression('()', s) : s
}
