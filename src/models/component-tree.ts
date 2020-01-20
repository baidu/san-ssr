import { ComponentInfo } from '../models/component-info'
import { isComponentLoader } from '../models/component'
import { ComponentConstructor } from 'san'
import { ComponentParser } from '../parsers/component-parser'

/**
 * 解析并维护组件树
 */
export class ComponentTree {
    readonly root: ComponentInfo
    private nodes = new Map<ComponentConstructor<{}, {}>, ComponentInfo>()
    private parser = new ComponentParser()

    constructor (ComponentClass: ComponentConstructor<{}, {}>) {
        this.root = this.addComponentClass(ComponentClass)
    }

    addComponentClass (ComponentClass: ComponentConstructor<{}, {}>): ComponentInfo {
        if (this.nodes.has(ComponentClass)) {
            return this.nodes.get(ComponentClass)
        }
        const info = this.parser.parseComponent(ComponentClass)
        this.nodes.set(ComponentClass, info)

        for (let component of Object.values(info.components)) {
            if (isComponentLoader(component)) {
                component = component.placeholder
            }
            if (!component) continue
            info.children.push(this.addComponentClass(component))
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
