import { isFunction, map } from 'lodash'
import { ANodeCompiler } from './anode-compiler'
import { ComponentTree } from '../../models/component-tree'
import { ComponentInfo } from '../../models/component-info'
import { JSEmitter } from '../emitters/emitter'
import { SanData } from '../../models/san-data'
import { Renderer } from '../../models/renderer'
import { expr } from './expr-compiler'
import { stringifier } from './stringifier'
import { ElementCompiler } from './element-compiler'
import { COMPONENT_RESERVED_MEMBERS } from '../../models/component'

// * 参数列表用于 toSource 和 toRender 两处，anode-compiler 中递归时要与此保持一致
// * 前两个参数是为了保持和最终的 renderer 兼容，如此就不需要包装
const RENDERER_ARGS = ['data = {}', 'noDataOutput', 'sanssrRuntime', 'ownerCtx', 'parentCtx', 'tagName', 'sourceSlots']

export type ExpressionEvaluator = (ctx: CompileContext) => any

export interface Data {
    [key: string]: any
}

export interface ComponentRender {
    (data: Data, noDataOutput: boolean, ownerCtx: CompileContext, parentCtx: CompileContext, tagName: string, sourceSlots: SourceSlot[]): string
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
    constructor (
        private noTemplateOutput: boolean,
        private componentTree: ComponentTree,
        public emitter = new JSEmitter()
    ) {}

    public compileComponentSource (componentInfo: ComponentInfo) {
        this.emitter.writeAnonymousFunction(RENDERER_ARGS, () => {
            this.compileComponentRendererBody(componentInfo)
        })
        return this.emitter.fullText()
    }

    public compileComponentRenderer (componentInfo: ComponentInfo) {
        this.emitter.clear()
        const body = this.compileComponentRendererBody(componentInfo)
        return new Function(...RENDERER_ARGS, body) // eslint-disable-line no-new-func
    }

    public compileComponentPrototypeSource (componentInfo: ComponentInfo) {
        const component = componentInfo.component
        const ComponentProto = component.constructor.prototype
        const builtinKeys = ['components', '_cmptReady', 'aNode', 'constructor']
        const { emitter } = this

        // members for call expr
        for (const protoMemberKey of Object.getOwnPropertyNames(ComponentProto)) {
            if (builtinKeys.includes(protoMemberKey)) continue

            const protoMember = ComponentProto[protoMemberKey]
            if (COMPONENT_RESERVED_MEMBERS.has(protoMemberKey) || !protoMember) continue

            switch (typeof protoMember) {
            case 'function':
                const funcString = functionString(protoMember)
                emitter.writeLines(protoMemberKey + ': ' + funcString + ',')
                break

            case 'object':
                emitter.nextLine(protoMemberKey + ': ')

                if (protoMember instanceof Array) {
                    emitter.feedLine('[')
                    emitter.indent()
                    const lines = protoMember.map(item => isFunction(item) ? functionString(item) : String(item)).join(',\n')
                    emitter.writeLines(lines)
                    emitter.unindent()
                    emitter.writeLine('],')
                } else {
                    emitter.feedLine('{')
                    emitter.indent()
                    const members = Object.getOwnPropertyNames(protoMember).filter(key => isFunction(protoMember[key]))
                    for (const itemKey of members) {
                        const item = protoMember[itemKey]
                        emitter.writeLines(itemKey + ':' + functionString(item) + ',')
                    }
                    emitter.unindent()
                    emitter.writeLine('},')
                }
            }
        }

        // filters
        emitter.writeLine('filters: {')
        emitter.writeIndentedLines(map(
            componentInfo.filters,
            (fn, key) => `${key}: ${functionString(fn)}`
        ).join(', '))
        emitter.writeLine('},')

        // computed obj
        emitter.writeLine('computed: {')
        emitter.writeIndentedLines(map(
            componentInfo.computed,
            (fn, key) => `${key}: ${functionString(fn)}`
        ).join(', '))
        emitter.writeLine('},')

        // tagName
        emitter.writeLine('tagName: "' + component.aNode.tagName + '"')
    }

    public compileComponentRendererBody (componentInfo: ComponentInfo) {
        const { emitter } = this
        const component = componentInfo.component
        emitter.writeLine('var _ = sanssrRuntime._;')
        emitter.writeLine('var SanData = sanssrRuntime.SanData;')
        emitter.writeLine('var html = "";')

        this.genComponentContextCode(componentInfo)
        emitter.writeLine(`var currentCtx = ctx;`)

        // instance preraration
        const defaultData = (component.initData && component.initData()) || {}
        for (const key of Object.keys(defaultData)) {
            emitter.writeLine('ctx.data["' + key + '"] = ctx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        }
        emitter.writeLine('ctx.instance.data = new SanData(ctx.data, ctx.instance.computed)')
        emitter.writeLine(`ctx.instance.parentComponent = parentCtx && parentCtx.instance`)

        // call inited
        if (typeof component.inited === 'function') {
            emitter.writeLine('ctx.instance.inited()')
        }

        // calc computed
        emitter.writeLine('var computedNames = ctx.computedNames;')
        emitter.writeFor('var $i = 0; $i < computedNames.length; $i++', () => {
            emitter.writeLine('var $computedName = computedNames[$i];')
            emitter.writeLine('data[$computedName] = ctx.instance.computed[$computedName].apply(ctx.instance);')
        })

        const ifDirective = component.aNode.directives['if'] // eslint-disable-line dot-notation
        if (ifDirective) emitter.writeLine('if (' + expr(ifDirective.value) + ') {')

        const aNodeCompiler = new ANodeCompiler(componentInfo, this.componentTree, this.noTemplateOutput, emitter)
        aNodeCompiler.compile(component.aNode, true)

        if (ifDirective) emitter.writeLine('}')
        emitter.writeLine('return html;')
        return emitter.fullText()
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    private genComponentContextCode (componentInfo: ComponentInfo) {
        const { emitter } = this
        emitter.writeBlock('var ctx =', () => {
            emitter.writeLine(`instance: _.createFromPrototype(sanssrRuntime.prototype${componentInfo.cid}),`)
            emitter.writeLine('sourceSlots: sourceSlots,')
            emitter.writeLine('data: data,')
            emitter.writeLine('owner: ownerCtx,')

            // computedNames
            emitter.nextLine('computedNames: [')
            emitter.write(Object.keys(componentInfo.computed).map(x => `'${x}'`).join(', '))
            emitter.feedLine('],')

            emitter.writeLine('slotRenderers: {}')
        })
    }
}

function functionString (fn: Function) {
    let str = fn.toString()
    if (!/^\s*function(\s|\()/.test(str) && /^\s*\w+\s*\([^)]*\)\s*{/.test(str)) { // es6 method syntax: foo(){}
        str = 'function ' + str
    }
    /**
     * 去除函数外缩进。例如：
     *
     * Input:
     * function() {
     *         console.log(1)
     *         return 1
     *     }
     *
     * Output:
     * function() {
     *     console.log(1)
     *     return 1
     * }
     */
    const lines = str.split('\n')
    const firstLine = lines.shift()!
    const minIndent = lines.reduce(
        (min: number, line: string) => Math.min(min, /^\s*/.exec(line)![0].length),
        Infinity
    )
    return [firstLine, ...lines.map(line => line.slice(minIndent))].join('\n')
}
