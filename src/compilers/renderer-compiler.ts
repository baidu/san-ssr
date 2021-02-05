import { ANodeCompiler } from './anode-compiler'
import { ComponentInfo } from '../models/component-info'
import { RenderOptions } from './renderer-options'
import { FunctionDefinition, ComputedCall, Foreach, FunctionCall, MapLiteral, If, CreateComponentInstance, ImportHelper, ComponentReferenceLiteral, ConditionalExpression } from '../ast/renderer-ast-node'
import { EMPTY_MAP, STATEMENT, NEW, BINARY, ASSIGN, DEF, RETURN, createDefaultValue, L, I, NULL, UNDEFINED } from '../ast/renderer-ast-factory'
import { IDGenerator } from '../utils/id-generator'
import { mergeLiteralAdd } from '../optimizers/merge-literal-add'

/**
 * 每个 ComponentClass 对应一个 Render 函数，由 RendererCompiler 生成。
 */
export class RendererCompiler {
    private id = new IDGenerator()

    constructor (
        private options: RenderOptions
    ) {}

    /**
     * 把 ComponentInfo 编译成函数源码，返回 Renderer 函数的 AST
     */
    public compileToRenderer (componentInfo: ComponentInfo) {
        const args = [DEF('data'), DEF('noDataOutput', L(false)), DEF('parentCtx', NULL), DEF('tagName', L('div')), DEF('slots', EMPTY_MAP)]
        const fn = new FunctionDefinition(this.options.functionName || '', args,
            this.compileComponentRendererBody(componentInfo)
        )
        mergeLiteralAdd(fn)
        return fn
    }

    private compileComponentRendererBody (info: ComponentInfo) {
        const body = []
        // 没有 ANode 的组件，比如 load-success 样例
        if (!info.root) {
            body.push(RETURN(L('')))
            return body
        }
        body.push(new ImportHelper('_'))
        body.push(new ImportHelper('SanSSRData'))
        body.push(...this.compileContext(info))

        // instance preraration
        if (info.hasMethod('initData')) {
            body.push(...(info.initData
                ? this.emitInitDataInCompileTime(info.initData())
                : this.emitInitDataInRuntime())
            )
        }

        // call inited
        if (info.hasMethod('inited')) {
            body.push(STATEMENT(new FunctionCall(
                BINARY(I('instance'), '.', I('inited')),
                []
            )))
        }

        // calc computed
        for (const name of info.getComputedNames()) {
            body.push(ASSIGN(BINARY(I('data'), '[]', L(name)), new ComputedCall(name)))
        }

        body.push(DEF('html', L('')))
        body.push(ASSIGN(I('parentCtx'), I('ctx')))
        const aNodeCompiler = new ANodeCompiler(info, !!this.options.ssrOnly, this.id)
        body.push(...aNodeCompiler.compile(info.root, true))

        body.push(RETURN(I('html')))
        return body
    }

    private compileContext (info: ComponentInfo) {
        const refs = info.hasDynamicComponent()
            ? new MapLiteral([...info.childComponents.entries()].map(([key, val]) => [L(key), new ComponentReferenceLiteral(val)]))
            : EMPTY_MAP
        return [
            DEF('instance', new CreateComponentInstance(info)),
            ASSIGN(
                BINARY(I('instance'), '.', I('data')),
                NEW(I('SanSSRData'), [I('data'), I('instance')])
            ),
            new If(
                I('parentCtx'), [ASSIGN(
                    BINARY(I('instance'), '.', I('parentComponent')),
                    BINARY(I('parentCtx'), '.', I('instance'))
                )]
            ),
            DEF('refs', refs),
            DEF('ctx', new MapLiteral([I('instance'), I('slots'), I('data'), I('parentCtx'), I('refs')]))
        ]
    }

    private emitInitDataInCompileTime (initData: any) {
        const defaultData = initData || {}
        return Object.entries(defaultData).map(([key, value]) => {
            const item = BINARY(I('data'), '[]', L(key))
            const rhs = BINARY(item, '||', L(value))
            return ASSIGN(item, rhs)
        })
    }

    private emitInitDataInRuntime () {
        const item = BINARY(BINARY(I('ctx'), '.', I('data')), '[]', I('key'))

        return [
            ASSIGN(
                I('initData'),
                new FunctionCall(BINARY(I('instance'), '.', I('initData')), [])
            ),
            createDefaultValue(I('initData'), new MapLiteral([])),
            new Foreach(I('key'), I('value'), I('initData'), [
                ASSIGN(item, new ConditionalExpression(BINARY(item, '!==', UNDEFINED), item, I('value')))
            ])
        ]
    }
}
