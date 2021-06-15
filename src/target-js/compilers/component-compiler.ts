/**
 * 把 DynamicComponentInfo（从 Component Class 来）输出为 JavaScript 源代码
 */
import { isFunction } from 'lodash'
import { COMPONENT_RESERVED_MEMBERS } from '../../models/component'
import { functionString } from '../../utils/lang'
import { JSEmitter } from '../js-emitter'
import { DynamicComponentInfo } from '../../models/component-info'
import { Component } from 'san'

export class ComponentClassCompiler {
    private emitedMemberKeys = new Set();
    constructor (public emitter = new JSEmitter()) {}

    /**
     * 编译一个 ComponentClass 的 proto。例如输入组件类：
     *
     * class Foo { computed = { author: () => 'harttle' } }
     *
     * 输出字符串：
     *
     * computed: {
     *     author: () => 'harttle'
     * },
     */
    public compile (componentInfo: DynamicComponentInfo) {
        this.emitMembers(componentInfo.proto)

        // 组件继承的可能不直接是 san 的 Component
        // 这里将父类上的属性直接输出
        this.emitPrototypes(componentInfo.componentClass)
    }

    private emitPrototypes (clas: {new(): any}) {
        const proto = Object.getPrototypeOf(clas)

        // 这里 proto !== Component 可能拦截不到
        // 所以在 COMPONENT_RESERVED_MEMBERS 中加了对 Component 上属性的过滤
        if (
            proto.name !== 'Component' &&
            proto !== Component &&
            proto.prototype !== Function.prototype
        ) {
            this.emitMembers(proto.prototype)
            this.emitPrototypes(proto)
        }
    }

    private emitMembers (componentProto: Object) {
        const { emitter } = this
        for (const key of Object.getOwnPropertyNames(componentProto)) {
            const member = componentProto[key]
            if (
                COMPONENT_RESERVED_MEMBERS.has(key) ||
                !member ||
                this.emitedMemberKeys.has(key)
            ) continue

            this.emitedMemberKeys.add(key)
            emitter.nextLine(key + ': ')
            if (typeof member === 'function') this.emitMethod(member, emitter)
            else if (member instanceof Array) this.emitArray(member, emitter)
            else this.emitObjectLiteral(member, emitter)
        }
    }

    private emitObjectLiteral (obj: any, emitter: JSEmitter) {
        emitter.feedLine('{')
        const members = Object.getOwnPropertyNames(obj).filter(key => isFunction(obj[key]))
        for (const itemKey of members) {
            const item = obj[itemKey]
            emitter.writeIndentedLines(itemKey + ':' + functionString(item) + ',')
        }
        emitter.writeLine('},')
    }

    private emitArray (arr: any[], emitter: JSEmitter) {
        emitter.feedLine('[')
        emitter.writeIndentedLines(
            arr.map(item => isFunction(item)
                ? functionString(item)
                : String(item)).join(',\n')
        )
        emitter.writeLine('],')
    }

    private emitMethod (fn: Function, emitter: JSEmitter) {
        const funcString = functionString(fn)
        emitter.feedLine(funcString + ',')
    }
}
