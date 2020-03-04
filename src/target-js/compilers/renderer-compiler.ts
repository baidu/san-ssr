import { isFunction, map } from 'lodash'
import { ComponentTree } from '../../models/component-tree'
import { ComponentInfo } from '../../models/component-info'
import { JSEmitter } from '../emitters/emitter'
import { SanData } from '../../models/san-data'
import { Renderer } from '../../models/renderer'
import { expr } from './expr-compiler'
import { stringifier } from './stringifier'
import { ElementCompiler } from './element-compiler'
import { ANodeCompiler } from './anode-compiler'
import { COMPONENT_RESERVED_MEMBERS } from '../../models/component'
import { CompiledComponent } from '../../models/compiled-component'
import { ComponentConstructor } from 'san'

// * 参数列表用于 toSource 和 toRender 两处，anode-compiler 中递归时要与此保持一致
// * 前两个参数是为了保持和最终的 renderer 兼容，如此就不需要包装
const RENDERER_ARGS = ['data = {}', 'noDataOutput', 'sanssrRuntime', 'parentCtx', 'tagName', 'sourceSlots']

export type ExpressionEvaluator = (ctx: CompileContext) => any

export interface Data {
    [key: string]: any
}

export interface ComponentRender {
    (data: Data, noDataOutput: boolean, parentCtx: CompileContext, tagName: string, sourceSlots: SourceSlot[]): string
}

export type SourceSlot = any

interface SanSSRComponent {
    filters: {
        [k: string]: (this: SanSSRComponent, ...args: any[]) => any
    }
    computed: {
        [k: string]: (this: { data: SanData }) => any
    }
    tagName: string
    data: SanData
}

export interface CompileContext {
    instance: SanSSRComponent
    sourceSlots: SourceSlot[]
    data: any,
    owner: CompileContext,
    computedNames: string[],
    slotRenderers: {[key: string]: Renderer}
}

/**
 * Each ComponentClass is compiled to a render function
 */
export class RendererCompiler {
    public component: CompiledComponent<{}>
    private aNodeCompiler: ANodeCompiler
    private elementCompiler: ElementCompiler
    private componentInfo: ComponentInfo
    private componentTree: ComponentTree

    constructor (componentInfo: ComponentInfo, noTemplateOutput: boolean, componentTree: ComponentTree) {
        this.componentTree = componentTree
        this.elementCompiler = new ElementCompiler(
            (...args) => this.aNodeCompiler.compile(...args),
            noTemplateOutput
        )
        this.component = componentInfo.createComponentInstance()
        this.componentInfo = componentInfo
        this.aNodeCompiler = new ANodeCompiler(
            this.component,
            this.elementCompiler,
            // TODO 从编译时移到运行时，见：https://github.com/baidu/san-ssr/issues/46
            (ComponentClass: ComponentConstructor<{}, {}>) => {
                return this.componentTree.addComponentClass(ComponentClass)
            }
        )
    }

    public compileComponentSource (emitter: JSEmitter = new JSEmitter()) {
        emitter.writeAnonymousFunction(RENDERER_ARGS, () => {
            this.compileComponentRendererBody(emitter)
        })
        return emitter.fullText()
    }

    public compileComponentRenderer () {
        const body = this.compileComponentRendererBody()
        return new Function(...RENDERER_ARGS, body) // eslint-disable-line no-new-func
    }

    public compileComponentPrototypeSource (emitter: JSEmitter) {
        const component = this.component
        const ComponentProto = component.constructor.prototype
        const builtinKeys = ['components', '_cmptReady', 'aNode', 'constructor']

        // members for call expr
        Object.getOwnPropertyNames(ComponentProto).forEach(function (protoMemberKey) {
            if (builtinKeys.includes(protoMemberKey)) return

            const protoMember = ComponentProto[protoMemberKey]
            if (COMPONENT_RESERVED_MEMBERS.has(protoMemberKey) || !protoMember) {
                return
            }

            switch (typeof protoMember) {
            case 'function':
                const funcString = functionString(protoMember)
                emitter.writeLine(protoMemberKey + ': ' + funcString + ',')
                break

            case 'object':
                emitter.writeLine(protoMemberKey + ':')

                if (protoMember instanceof Array) {
                    emitter.writeLine('[')
                    const lines = protoMember.map(item => isFunction(item) ? functionString(item) : '').join(', ')
                    emitter.writeLines(lines + ',')
                } else {
                    emitter.writeLine('{')
                    emitter.indent()
                    const members = Object.getOwnPropertyNames(protoMember).filter(key => isFunction(protoMember[key]))
                    members.forEach(function (itemKey) {
                        const item = protoMember[itemKey]
                        emitter.writeLine(itemKey + ':' + functionString(item) + ',')
                    })
                    emitter.unindent()
                    emitter.writeLine('},')
                }
            }
        })

        // filters
        emitter.writeLine('filters: {')
        emitter.writeIndentedLines(map(
            this.componentInfo.filters,
            (fn, key) => `${key}: ${functionString(fn)}`
        ).join(', '))
        emitter.writeLine('},')

        // computed obj
        emitter.writeLine('computed: {')
        emitter.writeIndentedLines(map(
            this.componentInfo.computed,
            (fn, key) => `${key}: ${functionString(fn)}`
        ).join(', '))
        emitter.writeLine('},')

        // tagName
        emitter.writeLine('tagName: "' + component.aNode.tagName + '"')
    }

    public compileComponentRendererBody (emitter: JSEmitter = new JSEmitter()) {
        emitter.writeLine('var _ = sanssrRuntime._;')
        emitter.writeLine('var SanData = sanssrRuntime.SanData;')
        emitter.writeLine('var html = "";')

        this.genComponentContextCode(emitter)

        // init data
        const defaultData = (this.component.initData && this.component.initData()) || {}
        Object.keys(defaultData).forEach(function (key) {
            emitter.writeLine('componentCtx.data["' + key + '"] = componentCtx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        })
        emitter.writeLine('componentCtx.instance.data = new SanData(componentCtx.data, componentCtx.instance.computed)')

        // call inited
        if (typeof this.component.inited === 'function') {
            emitter.writeLine('componentCtx.instance.inited()')
        }

        // calc computed
        emitter.writeLine('var computedNames = componentCtx.computedNames;')
        emitter.writeFor('var $i = 0; $i < computedNames.length; $i++', () => {
            emitter.writeLine('var $computedName = computedNames[$i];')
            emitter.writeLine('data[$computedName] = componentCtx.instance.computed[$computedName].apply(componentCtx.instance);')
        })

        const ifDirective = this.component.aNode.directives['if'] // eslint-disable-line dot-notation
        if (ifDirective) {
            emitter.writeLine('if (' + expr(ifDirective.value) + ') {')
        }

        this.elementCompiler.tagStart(emitter, this.component.aNode, 'tagName')

        emitter.writeIf('!noDataOutput', () => {
            emitter.writeDataComment()
        })

        this.elementCompiler.inner(emitter, this.component.aNode)
        this.elementCompiler.tagEnd(emitter, this.component.aNode, 'tagName')

        if (ifDirective) {
            emitter.writeLine('}')
        }

        emitter.writeLine('return html;')
        return emitter.fullText()
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    private genComponentContextCode (emitter: JSEmitter) {
        emitter.writeBlock('var componentCtx =', () => {
            emitter.writeLine(`instance: _.createFromPrototype(sanssrRuntime.prototype${this.componentInfo.cid}),`)
            emitter.writeLine('sourceSlots: sourceSlots,')
            emitter.writeLine('data: data,')
            emitter.writeLine('owner: parentCtx,')

            // computedNames
            emitter.nextLine('computedNames: [')
            emitter.write(Object.keys(this.componentInfo.computed).map(x => `'${x}'`).join(', '))
            emitter.feedLine('],')

            emitter.writeLine('slotRenderers: {}')
        })
    }
}

function functionString (fn: Function) {
    let str = fn.toString()
    if (!/^function /.test(str)) { // es6 method syntax
        str = 'function ' + str
    }
    return str
}
