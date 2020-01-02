import { noop } from 'lodash'
import { CompileSourceBuffer } from '../source-buffer'
import { compileExprSource } from './expr-compiler'
import { stringifier } from './stringifier'
import { ElementCompiler } from './element-compiler'
import { ANodeCompiler } from './anode-compiler'
import { COMPONENT_RESERVED_MEMBERS, SanComponent } from '../../models/component'

/**
 * Each ComponentClass is compiled to a render function
 */
export class RendererCompiler<T> {
    private aNodeCompiler
    private elementSourceCompiler
    private component: SanComponent
    private funcName: string

    constructor (ComponentClass: typeof SanComponent, noTemplateOutput) {
        this.elementSourceCompiler = new ElementCompiler(
            (...args) => this.aNodeCompiler.compile(...args),
            noTemplateOutput
        )
        this.funcName = 'sanssrRenderer' + ComponentClass.sanssrCid
        this.component = this.createComponentInstance(ComponentClass)
        this.aNodeCompiler = new ANodeCompiler(
            this.elementSourceCompiler,
            this.component
        )
    }
    /**
    * 生成组件构建的代码
    *
    * @inner
    * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
    * @param {Function} ComponentClass 组件类
    * @param {string} contextId 构建render环境的id
    * @return {string} 组件在当前环境下的方法标识
    */
    public compileComponentSource () {
        const funcName = this.funcName
        const sourceBuffer = new CompileSourceBuffer()
        // 先初始化个实例，让模板编译成 ANode，并且能获得初始化数据
        sourceBuffer.addRaw(`var ${funcName}Proto = ` + this.genComponentProtoCode(this.component))
        sourceBuffer.addRaw(`function ${funcName}(data, noDataOutput, parentCtx, tagName, sourceSlots) {`)
        sourceBuffer.addRaw('var html = "";')

        sourceBuffer.addRaw(this.genComponentContextCode(funcName))

        // init data
        const defaultData = (this.component.initData && this.component.initData()) || {}
        Object.keys(defaultData).forEach(function (key) {
            sourceBuffer.addRaw('componentCtx.data["' + key + '"] = componentCtx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        })
        sourceBuffer.addRaw('componentCtx.proto.data = new SanData(componentCtx)')

        // call inited
        if (typeof this.component.inited === 'function') {
            sourceBuffer.addRaw('componentCtx.proto.inited()')
        }

        // calc computed
        sourceBuffer.addRaw('var computedNames = componentCtx.computedNames;')
        sourceBuffer.addRaw('for (var $i = 0; $i < computedNames.length; $i++) {')
        sourceBuffer.addRaw('  var $computedName = computedNames[$i];')
        sourceBuffer.addRaw('  data[$computedName] = componentCtx.proto.computed[$computedName].apply(componentCtx.proto);')
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
        return sourceBuffer.toCode()
    }

    /**
    * 生成组件 renderer 时 ctx 对象构建的代码
    */
    private genComponentContextCode (componentIdInContext: string) {
        const code = ['var componentCtx = {']

        // proto
        code.push('proto: ' + componentIdInContext + 'Proto,')

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

    /**
    * 生成组件 proto 对象构建的代码
    */
    private genComponentProtoCode (component) {
        const code = ['{']

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
                code.push(protoMemberKey + ': ' + funcString + ',')
                break

            case 'object':
                code.push(protoMemberKey + ':')

                if (protoMember instanceof Array) {
                    code.push('[')
                    protoMember.forEach(function (item) {
                        code.push(typeof item === 'function' ? functionString(item) : '' + ',')
                    })
                    code.push(']')
                } else {
                    code.push('{')

                    Object.getOwnPropertyNames(protoMember).forEach(function (itemKey) {
                        const item = protoMember[itemKey]
                        if (typeof item === 'function') {
                            code.push(itemKey + ':' + functionString(item) + ',')
                        }
                    })
                    code.push('}')
                }

                code.push(',')
            }
        })

        // filters
        code.push('filters: {')
        const filterCode = []
        for (const key in component.filters) {
            if (component.filters.hasOwnProperty(key)) {
                const filter = component.filters[key]

                if (typeof filter === 'function') {
                    filterCode.push(key + ': ' + functionString(filter))
                }
            }
        }
        code.push(filterCode.join(','))
        code.push('},')

        /* eslint-disable no-redeclare */
        // computed obj
        code.push('computed: {')
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
        code.push(computedCode.join(','))
        code.push('},')

        // tagName
        code.push('tagName: "' + component.tagName + '"')

        code.push('};')

        return code.join('\n')
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
