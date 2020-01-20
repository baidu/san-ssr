import { noop } from 'lodash'
import { ComponentConstructor, SanComponent } from 'san'
import { CompiledComponent } from './compiled-component'
import { Filters, Computed } from './component'

/**
 * 提供一个组件信息封装
 *
 * 目的：
 * 1. 避免 SSR 对组件构造函数/类产生副作用
 * 2. 对外提供规范化（normalized）的组件信息
 *
 * Note：这里只是存数据，它的创建由 componentParser 负责
 */
export class ComponentInfo {
    public readonly filters: Filters
    public readonly computed: Computed
    public readonly template: string
    public readonly cid: number
    public readonly ComponentClass: typeof SanComponent
    // child Component Info nodes
    public readonly children: ComponentInfo[]
    // Raw components
    public readonly components: ComponentConstructor<{}, {}>

    constructor ({ filters, computed, template, cid, ComponentClass, children = [], components }) {
        this.filters = filters
        this.computed = computed
        this.template = template
        this.cid = cid
        this.ComponentClass = ComponentClass
        this.children = children
        this.components = components
    }

    createComponentInstance (): CompiledComponent<{}> {
        // TODO Do not `new Component` during SSR,
        // see https://github.com/baidu/san-ssr/issues/42
        const ComponentClass = this.ComponentClass
        const proto = ComponentClass.prototype['__proto__']    // eslint-disable-line
        const calcComputed = proto['_calcComputed']
        const inited = ComponentClass.prototype['inited']
        proto['_calcComputed'] = noop
        ComponentClass.prototype['inited'] = undefined
        const instance = new ComponentClass()
        ComponentClass.prototype['inited'] = inited
        proto['_calcComputed'] = calcComputed
        return instance as CompiledComponent<{}>
    }
}
