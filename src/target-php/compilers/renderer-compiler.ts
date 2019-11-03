/**
 * 将组件树编译成 render 函数之间的递归调用
 * 提供 generateRenderModule 方法
 */
import { compileExprSource } from '../compilers/expr-compiler'
import { Stringifier } from './stringifier'
import { ANodeCompiler } from './anode-compiler'
import { ElementCompiler } from './element-compiler'

export class RendererCompiler {
    private namespacePrefix = ''
    private stringifier: Stringifier
    private aNodeCompiler: ANodeCompiler
    private elementCompiler: ElementCompiler
    private emitter
    private component

    constructor (ComponentClass, emitter, nsPrefix: string) {
        this.emitter = emitter
        this.component = new ComponentClass()
        this.stringifier = new Stringifier(nsPrefix)
        this.elementCompiler = new ElementCompiler(
            (aNodeChild, emitter) => this.aNodeCompiler.compile(aNodeChild, emitter)
        )
        this.aNodeCompiler = new ANodeCompiler(this.component, this.elementCompiler, this.stringifier)
    }

    /**
    * 生成组件渲染的函数体
    */
    compile () {
        const emitter = this.emitter
        emitter.writeLine('$html = "";')

        this.genComponentContextCode(this.component, emitter)

        // init data
        const defaultData = this.component.data.get()
        emitter.writeIf('$data', () => {
            for (const key of Object.keys(defaultData)) {
                const val = this.stringifier.any(defaultData[key])
                if (val === 'NaN') continue
                emitter.writeLine(`$ctx->data->${key} = isset($ctx->data->${key}) ? $ctx->data->${key} : ${val};`)
            }
        })

        // calc computed
        emitter.writeForeach('$ctx->computedNames as $i => $computedName', () => {
            emitter.writeLine('$data->$computedName = _::callComputed($ctx, $computedName);')
        })

        const ifDirective = this.component.aNode.directives['if']
        if (ifDirective) {
            emitter.writeLine('if (' + compileExprSource.expr(ifDirective.value) + ') {')
            emitter.indent()
        }

        this.elementCompiler.tagStart(emitter, this.component.aNode, 'tagName')
        emitter.writeIf('!$noDataOutput', () => emitter.writeDataComment())
        this.elementCompiler.inner(emitter, this.component.aNode)
        this.elementCompiler.tagEnd(emitter, this.component.aNode, 'tagName')

        if (ifDirective) {
            emitter.unindent()
            emitter.writeLine('}')
        }

        emitter.writeLine('return $html;')
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    genComponentContextCode (component, emitter) {
        emitter.nextLine('$ctx = (object)[')
        emitter.indent()

        emitter.nextLine('"computedNames" => [')
        emitter.write(Object.keys(component.computed).map(x => `"${x}"`).join(','))
        emitter.feedLine('],')

        emitter.writeLine(`"sanssrCid" => ${component.constructor.sanssrCid || 0},`)
        emitter.writeLine('"sourceSlots" => $sourceSlots,')
        emitter.writeLine('"data" => $data ? $data : (object)[],')
        emitter.writeLine('"owner" => $parentCtx,')
        emitter.writeLine('"slotRenderers" => []')

        emitter.unindent()
        emitter.writeLine('];')
        emitter.writeLine('$ctx->instance = _::createComponent($ctx);')
    }
}
