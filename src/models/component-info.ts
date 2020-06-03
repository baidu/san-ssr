import { ANode, ComponentConstructor } from 'san'
import { Components, ComponentClass, Filters, Computed } from './component'

interface ComponentInfoOptions {
    filters: Filters
    rootANode: ANode,
    computed: Computed
    template?: string
    cid: number
    children?: ComponentInfo[]
    componentClass: ComponentClass
    childComponentClasses: Components
}

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
    public readonly template?: string
    public readonly cid: number
    public readonly componentClass: ComponentConstructor<{}, {}>
    public readonly proto: { initData?: () => any, inited?: () => void }
    // child Component Info nodes
    public readonly children: ComponentInfo[]
    // Raw components
    public readonly childComponentClasses: Components
    public readonly rootANode: ANode

    constructor ({ filters, computed, template, cid, componentClass, children = [], childComponentClasses, rootANode }: ComponentInfoOptions) {
        this.rootANode = rootANode
        this.filters = filters
        this.computed = computed
        this.template = template
        this.cid = cid
        this.componentClass = componentClass
        this.children = children
        this.childComponentClasses = childComponentClasses

        const proto = componentClass.prototype
        proto.filters = Object.assign({}, proto.filters, componentClass['filters'])
        proto.computed = Object.assign({}, proto.computed, componentClass['computed'])
        this.proto = proto
    }
    getChildComponentClass (aNode: ANode) {
        return this.childComponentClasses.get(aNode) || this.childComponentClasses.get(aNode.tagName)
    }
}
