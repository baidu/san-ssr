import { ExpressionStatement, FunctionCall, FunctionDefinition, SyntaxKind } from '../../ast/renderer-ast-dfn'
import assert from 'assert'
import { I } from '../../ast/renderer-ast-util'

/**
 * 在 render 函数中，ctx 初始化之后，增加 setGlobalCtx 函数的调用
 */
export function insertSetGlobalCtxCall (fn: FunctionDefinition) {
    const body = [...fn.body]
    const index = body.findIndex((value) =>
        value.kind === SyntaxKind.VariableDefinition && value.name === 'ctx'
    )

    assert(typeof index === 'number')

    fn.body = [
        ...body.slice(0, index + 1),
        new ExpressionStatement(new FunctionCall(I('setGlobalCtx'), [I('ctx')])),
        ...body.slice(index + 1)
    ]
}
