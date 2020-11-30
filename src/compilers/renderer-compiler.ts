import { ANodeCompiler } from './anode-compiler'
import { stringifier } from '../target-js/compilers/stringifier'
import { ComponentInfo } from '../models/component-info'
import { JSEmitter } from '../target-js/js-emitter'

export const RENDERER_ARGS = ['data = {}', 'noDataOutput', 'parentCtx', 'tagName = "div"', 'slots']

/**
 * Each ComponentClass is compiled to a render function
 */
export class RendererCompiler {
    constructor (
        private ssrOnly: boolean,
        public emitter = new JSEmitter()
    ) {}

    /**
     * 把 ComponentInfo 编译成 Render JS 匿名函数源码
     */
    public compileComponentRendererSource (componentInfo: ComponentInfo) {
        this.emitter.writeAnonymousFunction(RENDERER_ARGS, () => {
            this.compileComponentRendererBody(componentInfo)
        })
        return this.emitter.fullText()
    }

    public compileComponentRendererBody (info: ComponentInfo) {
        const { emitter } = this
        // 没有 ANode 的组件，比如 load-success 样例
        if (!info.root) {
            emitter.writeLine('return ""')
            return emitter.fullText()
        }
        emitter.writeLine('const { _, SanData } = sanSSRHelpers;')
        emitter.writeLine('let html = "";')

        this.genComponentContextCode(info)
        emitter.writeLine('parentCtx = ctx;')

        // instance preraration
        if (info.hasMethod('initData')) {
            if (info.initData) this.emitInitDataInCompileTime(info.initData())
            else this.emitInitDataInRuntime()
        }

        // call inited
        if (info.hasMethod('inited')) {
            emitter.writeLine('ctx.instance.inited()')
        }

        // calc computed
        const computedNames = info.getComputedNames()
        if (computedNames.length) {
            emitter.writeFor(`let name of [${computedNames.map(x => `'${x}'`).join(', ')}]`, () => {
                emitter.writeLine('data[name] = ctx.instance.computed[name].apply(ctx.instance);')
            })
        }

        const aNodeCompiler = new ANodeCompiler(info, this.ssrOnly, emitter)
        aNodeCompiler.compile(info.root, true)

        emitter.writeLine('return html;')
        return emitter.fullText()
    }

    public emitInitDataInCompileTime (initData: any) {
        const defaultData = initData || {}
        for (const key of Object.keys(defaultData)) {
            this.emitter.writeLine('ctx.data["' + key + '"] = ctx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        }
    }

    public emitInitDataInRuntime () {
        this.emitter.writeLine('let sanSSRInitData = ctx.instance.initData() || {}')
        this.emitter.writeFor('let key of Object.keys(sanSSRInitData)', () => {
            this.emitter.writeLine('ctx.data[key] = ctx.data[key] || sanSSRInitData[key]')
        })
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    private genComponentContextCode (componentInfo: ComponentInfo) {
        const { emitter } = this
        emitter.writeLine(`let instance = _.createFromPrototype(sanSSRResolver.getPrototype("${componentInfo.id}"));`)
        emitter.writeLine('instance.data = new SanData(data, instance.computed)')
        emitter.writeLine('instance.parentComponent = parentCtx && parentCtx.instance')
        emitter.writeLine('let ctx = {instance, slots, data, parentCtx}')

        if (componentInfo.hasDynamicComponent()) {
            const refs = [...componentInfo.childComponents.entries()].map(([key, val]) => `"${key}": ${val}`).join(', ')
            emitter.writeLine(`ctx.refs = {${refs}}`)
        }
    }
}
