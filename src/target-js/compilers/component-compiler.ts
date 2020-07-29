import { isFunction } from 'lodash'
import { COMPONENT_RESERVED_MEMBERS } from '../../models/component'
import { functionString } from '../../utils/lang'
import { JSEmitter } from '../js-emitter'
import { DynamicComponentInfo } from '../../models/component-info'

export class ComponentClassCompiler {
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
        const { emitter } = this
        for (const key of Object.getOwnPropertyNames(componentInfo.proto)) {
            const member = componentInfo.proto[key]
            if (COMPONENT_RESERVED_MEMBERS.has(key) || !member) continue

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
