import { isFunction, noop } from 'lodash'
import { JSEmitter } from '../emitters/emitter'
import { SanData } from '../../models/san-data'
import { CompileSourceBuffer } from '../source-buffer'
import { Renderer } from '../../models/renderer'
import { compileExprSource, ExpressionCompiler } from './expr-compiler'
import { stringifier } from './stringifier'
import { ElementCompiler } from './element-compiler'
import { ANodeCompiler } from './anode-compiler'
import { COMPONENT_RESERVED_MEMBERS, SanComponent } from '../../models/component'

export type ExpressionEvaluator = (ctx: CompileContext) => any

export interface Data {
    [key: string]: any
}

export interface ComponentRender {
    (data: Data, noDataOutput: boolean, parentCtx: CompileContext, tagName: string, sourceSlots: SourceSlot[]): string
}

export type SourceSlot = any

export interface CompileContext {
    instance: SanComponent
    sourceSlots: SourceSlot[]
    data: any,
    owner: CompileContext,
    computedNames: string[],
    slotRenderers: {[key: string]: Renderer}
}

/**
 * Each ComponentClass is compiled to a render function
 */
export class RendererCompiler<T> {
    private aNodeCompiler
    private elementSourceCompiler
    private ComponentClass: typeof SanComponent
    private component: SanComponent
    private renderers: Map<number, Renderer>
    private funcName: string

    constructor (ComponentClass: typeof SanComponent, noTemplateOutput, renderers?: Map<number, Renderer>) {
        this.renderers = renderers
        this.elementSourceCompiler = new ElementCompiler(
            (...args) => this.aNodeCompiler.compile(...args),
            noTemplateOutput
        )
        this.funcName = 'sanssrRenderer' + ComponentClass.sanssrCid
        this.component = this.createComponentInstance(ComponentClass)
        this.ComponentClass = ComponentClass
        this.aNodeCompiler = new ANodeCompiler(
            this.elementSourceCompiler,
            this.component
        )
    }

    public compileComponentRendererSource (emitter: JSEmitter = new JSEmitter()) {
        // TODO replace sourcebuffer with emitter
        const sourceBuffer = new CompileSourceBuffer()
        sourceBuffer.addRaw(`function ${this.funcName}(sanssrRuntime, data, noDataOutput, parentCtx, tagName, sourceSlots) {`)

        sourceBuffer.addRaw('var _ = sanssrRuntime._;')
        sourceBuffer.addRaw('var SanData = sanssrRuntime.SanData;')
        sourceBuffer.addRaw('var html = "";')

        sourceBuffer.addRaw(this.genComponentContextCode(this.funcName))

        // init data
        const defaultData = (this.component.initData && this.component.initData()) || {}
        Object.keys(defaultData).forEach(function (key) {
            sourceBuffer.addRaw('componentCtx.data["' + key + '"] = componentCtx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        })
        sourceBuffer.addRaw('componentCtx.instance.data = new SanData(componentCtx.data, componentCtx.instance.computed)')

        // call inited
        if (typeof this.component.inited === 'function') {
            sourceBuffer.addRaw('componentCtx.instance.inited()')
        }

        // calc computed
        sourceBuffer.addRaw('var computedNames = componentCtx.computedNames;')
        sourceBuffer.addRaw('for (var $i = 0; $i < computedNames.length; $i++) {')
        sourceBuffer.addRaw('  var $computedName = computedNames[$i];')
        sourceBuffer.addRaw('  data[$computedName] = componentCtx.instance.computed[$computedName].apply(componentCtx.instance);')
        sourceBuffer.addRaw('}')

        const ifDirective = this.component.aNode.directives['if'] // eslint-disable-line dot-notation
        if (ifDirective) {
            sourceBuffer.addRaw('if (' + compileExprSource.expr(ifDirective.value) + ') {')
        }

        this.elementSourceCompiler.tagStart(sourceBuffer, this.component.aNode, 'tagName')

        sourceBuffer.addRaw('if (!noDataOutput) {')
        sourceBuffer.joinDataStringify()
        sourceBuffer.addRaw('}')

        this.elementSourceCompiler.inner(sourceBuffer, this.component.aNode, this.component)
        this.elementSourceCompiler.tagEnd(sourceBuffer, this.component.aNode, 'tagName')

        if (ifDirective) {
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('return html;')
        sourceBuffer.addRaw('};')
        emitter.writeLines(sourceBuffer.toCode())
        return emitter.fullText()
    }

    public compileComponentInstanceSource (emitter: JSEmitter) {
        const component = this.component
        emitter.writeLine(`var ${this.funcName}Instance = {`)
        emitter.indent()

        // members for call expr
        const ComponentProto = component.constructor.prototype

        const builtinKeys = ['components', '_cmptReady', 'aNode', 'constructor']

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
        const filterCode = []
        for (const key in component.filters) {
            if (component.filters.hasOwnProperty(key)) {
                const filter = component.filters[key]

                if (typeof filter === 'function') {
                    filterCode.push(key + ': ' + functionString(filter))
                }
            }
        }
        emitter.writeLines(filterCode.join(','))
        emitter.writeLine('},')

        // computed obj
        emitter.writeLine('computed: {')
        emitter.indent()
        const computedCode = []
        for (const key in component.computed) {
            if (component.computed.hasOwnProperty(key)) {
                const computed = component.computed[key]

                if (typeof computed === 'function') {
                    const fn = functionString(computed)
                    computedCode.push(key + ': ' + fn)
                }
            }
        }
        emitter.writeLines(computedCode.join(','))
        emitter.unindent()
        emitter.writeLine('},')

        // tagName
        emitter.writeLine('tagName: "' + component.tagName + '"')

        emitter.unindent()
        emitter.writeLine('};')
    }

    public compileComponentRenderer () {
        const proto = this.genComponentProto()
        const exprCompiler = new ExpressionCompiler(proto)
        const defaultData = (this.component.initData && this.component.initData()) || {}

        const ifDirective = this.component.aNode.directives['if']
        const conditionExpr = ifDirective ? exprCompiler.expr(ifDirective.value) : null

        return function (data, noDataOutput, parentCtx: CompileContext, tagName, sourceSlots) {
            const ctx = this.genComponentContext(data, proto, parentCtx, proto, sourceSlots)

            // init data
            Object.keys(defaultData).forEach(function (key) {
                ctx.data[key] = ctx.data[key] || defaultData[key]
            })
            ctx.instance.data = new SanData(ctx.data, proto.computed)

            // call inited
            if (typeof this.component.inited === 'function') {
                ctx.instance.inited()
            }

            // calc computed
            const computedNames = ctx.computedNames
            for (let i = 0; i < computedNames.length; i++) {
                const computedName = computedNames[i]
                data[computedName] = ctx.instance.computed[computedName].call(ctx.instance)
            }

            // wrapped by if
            if (conditionExpr && !conditionExpr(ctx)) return ''
            return ''
        }
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    private genComponentContextCode (componentIdInContext: string) {
        const code = ['var componentCtx = {']

        // instance
        code.push('instance: ' + componentIdInContext + 'Instance,')

        // sourceSlots
        code.push('sourceSlots: sourceSlots,')

        // data
        const defaultData = this.component.data.get()
        code.push('data: data || ' + stringifier.any(defaultData) + ',')

        // parentCtx
        code.push('owner: parentCtx,')

        // computedNames
        code.push('computedNames: [')
        code.push(Object.keys(this.component.computed).map(x => `'${x}'`).join(','))
        code.push('],')

        // slotRenderers
        code.push('slotRenderers: {}')

        code.push('};')

        return code.join('\n')
    }

    private genComponentContext (data, proto, parentCtx, instance, sourceSlots): CompileContext {
        return {
            instance: this.createInstanceFromPrototype(proto),
            sourceSlots,
            data: data || this.component.data.get(),
            owner: parentCtx,
            computedNames: Object.keys(this.component.computed),
            slotRenderers: {}
        }
    }

    private createInstanceFromPrototype (proto: any) {
        function Creator () {}
        Creator.prototype = proto
        return new Creator()
    }

    private genComponentProto (): Partial<SanComponent> {
        const ComponentProto = this.ComponentClass.prototype
        const builtinKeys = ['components', '_cmptReady', 'aNode', 'constructor']
        const proto: Partial<typeof SanComponent> = {}

        Object.getOwnPropertyNames(ComponentProto).forEach(function (protoMemberKey) {
            if (builtinKeys.includes(protoMemberKey)) return
            if (COMPONENT_RESERVED_MEMBERS.has(protoMemberKey)) return
            proto[protoMemberKey] = ComponentProto[protoMemberKey]
        })
        if (this.ComponentClass.computed) {
            proto.computed = this.ComponentClass.computed
        }
        if (this.ComponentClass.filters) {
            proto.filters = this.ComponentClass.filters
        }
        return proto
    }

    private createComponentInstance (ComponentClass: typeof SanComponent) {
        // TODO Do not `new Component` during SSR,
        // see https://github.com/searchfe/san-ssr/issues/42
        const proto = ComponentClass.prototype['__proto__']    // eslint-disable-line
        const calcComputed = proto['_calcComputed']
        proto['_calcComputed'] = noop
        const instance = new ComponentClass()
        proto['_calcComputed'] = calcComputed
        return instance
    }
}

// TODO refactor to function instance
function functionString (fn) {
    let str = fn.toString()
    if (!/^function /.test(fn)) { // es6 method
        str = 'function ' + str
    }
    return str
}
