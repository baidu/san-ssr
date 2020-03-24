import { ComponentInfo } from '../models/component-info'
import { ComponentConstructor } from 'san'
import { ComponentParser } from '../parsers/component-parser'

/**
 * 解析并维护组件树：
 * 对 Component 实例的树进行了包装，并给出遍历的方式
 */
export class ComponentTree {
    readonly root: ComponentInfo
    private nodes = new Map<ComponentConstructor<{}, {}>, ComponentInfo>()
    private parser = new ComponentParser()

    constructor (ComponentClass: ComponentConstructor<{}, {}>) {
        const root = this.addComponentClass(ComponentClass)
        if (!root) throw new Error('cannot construct ComponentTree from empty root component')
        this.root = root
    }

    addComponentClass (ComponentClass: ComponentConstructor<{}, {}>): ComponentInfo | undefined {
        let info = this.nodes.get(ComponentClass)
        if (info) return info

        info = this.parser.parseComponent(ComponentClass)
        if (!info) return

        this.nodes.set(ComponentClass, info)
        for (const childComponentClass of info.childComponentClasses.values()) {
            const child = this.addComponentClass(childComponentClass)
            if (child) info.children.push(child)
        }
        return info
    }

    * preOrder (root = this.root, visited: Set<ComponentInfo> = new Set()): IterableIterator<ComponentInfo> {
        if (visited.has(root)) return
        else visited.add(root)

        yield root
        for (const child of root.children) yield * this.preOrder(child, visited)
    }
}
