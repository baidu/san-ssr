/**
 * 编译源码的 helper 方法集合
 */
import { ExprStringNode, ExprNode, ExprTertiaryNode, ExprBinaryNode, ExprUnaryNode, ExprInterpNode, ExprAccessorNode, ExprCallNode, ExprTextNode, ExprObjectNode, ExprArrayNode } from 'san'
import * as TypeGuards from '../ast/san-type-guards'
import { _ } from '../runtime/underscore'
import { EncodeURIComponent, MapLiteral, HelperCall, ArrayLiteral, FilterCall, FunctionCall, Identifier, ConditionalExpression, BinaryExpression, UnaryExpression, Expression } from '../ast/renderer-ast-node'
import { CTX_DATA, L, I, NULL } from '../ast/renderer-ast-factory'

// 输出为 HTML 并转义、输出为 HTML 不转义、非输出表达式
export type OutputType = 'html' | 'rawhtml' | 'expr'

// 二元表达式操作符映射表
const binaryOp = {
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
    throw new Error(`unexpected unary operator "${String.fromCharCode(e.operator)}"`)
}
function binary (e: ExprBinaryNode) {
    const lhs = sanExpr(e.segs[0])
    const op = binaryOp[e.operator]
    const rhs = sanExpr(e.segs[1])
    return new BinaryExpression(lhs, op, rhs)
}
function tertiary (e: ExprTertiaryNode) {
    return new ConditionalExpression(sanExpr(e.segs[0]), sanExpr(e.segs[1]), sanExpr(e.segs[2]))
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
    for (const path of paths) {
        fn = new BinaryExpression(fn, '[]', sanExpr(path))
    }
    return outputCode(new FunctionCall(fn, callExpr.args.map(arg => sanExpr(arg))), outputType)
}

function outputCode (data: Expression, outputType: OutputType) {
    if (outputType === 'expr') return data
    if (outputType === 'html') return new HelperCall('output', [data, L(true)])
    return new HelperCall('output', [data, L(false)])
}

// 生成插值代码
function interp (interpExpr: ExprInterpNode, outputType: OutputType) {
    let code = sanExpr(interpExpr.expr)

    for (const filter of interpExpr.filters) {
        const filterName = filter.name.paths[0].value

        if (['_style', '_class', '_xstyle', '_xclass', '_attr', '_boolAttr'].includes(filterName)) {
            code = new HelperCall(filterName.slice(1) + 'Filter' as any, [code, ...filter.args.map(arg => sanExpr(arg, 'expr'))])
        } else if (filterName === 'url') {
            code = new EncodeURIComponent(code)
        } else {
            code = new FilterCall(filterName, [code, ...filter.args.map(arg => sanExpr(arg, 'expr'))])
        }
    }
    // {{ | raw }}
    if (outputType === 'html' && interpExpr.original) {
        return outputCode(code, 'rawhtml')
    }
    return outputCode(code, outputType)
}

function str (e: ExprStringNode, output: OutputType) {
    return L(output === 'html' ? _.escapeHTML(e.value) : e.value)
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

// expr 的 JavaScript 表达式
export function sanExpr (e: ExprNode, output: OutputType = 'expr'): Expression {
    let s

    if (TypeGuards.isExprUnaryNode(e)) s = unary(e)
    else if (TypeGuards.isExprBinaryNode(e)) s = binary(e)
    else if (TypeGuards.isExprTertiaryNode(e)) s = tertiary(e)
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
