import debugFactory from 'debug'
import { ComponentConstructor, defineComponent, ANode } from 'san'
import { DynamicSanSourceFile } from '../models/san-source-file'
import { DynamicComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { isComponentLoader, ComponentClass } from '../models/component'
import { visitANodeRecursively } from '../utils/anode-util'
import { parseAndNormalizeTemplate } from './parse-template'
import { DynamicComponentReference, getComponentClassID } from '../models/component-reference'

/*
 * 从根 ComponentClass 递归搜索和解析所有 ComponentClass，形成 ComponentInfo 列表，并放到单个 SanSourceFile 中。
 *
 * Note: 每个组件树对应一个 parser 实例，如果要解析新的组件树，请创建新的 parser 实例
 */
export class ComponentClassParser {
    private id = 0
    private cids: Map<ComponentConstructor<{}, {}>, string> = new Map()

    constructor (
        private readonly root: ComponentConstructor<{}, {}>,
        private readonly filePath: string
    ) {}

    parse (): DynamicSanSourceFile {
        const componentInfos = []
        const stack: DynamicComponentReference[] = [{ componentClass: this.root, id: '' + this.id++, relativeFilePath: '.', isDefault: true }]
        const parsed = new Set()
        while (stack.length) {
            const { id, componentClass } = stack.pop()!
            if (parsed.has(componentClass)) continue
            else parsed.add(componentClass)

            const info = this.createComponentInfoFromComponentClass(componentClass, id)
            // 先序遍历，结果列表中第一个为根
            componentInfos.push(info)
            for (const child of info.childComponents.values()) stack.push(child)
        }
        return new DynamicSanSourceFile(componentInfos, this.filePath, componentInfos[0])
    }

    /**
     * 从组件 class 得到组件 component info
     */
    createComponentInfoFromComponentClass (componentClass: ComponentConstructor<{}, {}>, id: string): DynamicComponentInfo {
        if (isComponentLoader(componentClass)) {
            componentClass = componentClass.placeholder
        }
        if (!componentClass) componentClass = defineComponent({ template: '' })

        const template = getMember(componentClass, 'template', '')
        const rootANode = parseAndNormalizeTemplate(template)
        const childComponents = this.getChildComponentClasses(componentClass, rootANode)

        return new DynamicComponentInfo(id, template, rootANode, childComponents, componentClass)
    }

    /**
     * 从组件 class 得到子组件 class
     * - 从 .components 属性获取
     * - 从 .getComponentType() 方法获取
     */
    getChildComponentClasses (parentComponentClass: ComponentClass, rootANode: ANode): Map<string | ANode, DynamicComponentReference> {
        const children: Map<string | ANode, DynamicComponentReference> = new Map()

        const components: { [key: string]: ComponentConstructor<{}, {}> } = getMember(parentComponentClass, 'components', {})
        for (const [tagName, componentClass] of Object.entries(components)) {
            // 可能是空，例如 var Foo = defineComponent({components: {foo: Foo}})
            children.set(tagName, {
                relativeFilePath: '.',
                id: this.getOrSetID(componentClass),
                componentClass,
                isDefault: componentClass === this.root
            })
        }

        const getComponentType = parentComponentClass.prototype.getComponentType
        if (typeof getComponentType !== 'function') return children

        visitANodeRecursively(rootANode, (aNode: ANode) => {
            const childClazz: ComponentClass = getComponentType(aNode)
            if (!childClazz) return

            children.set(aNode, {
                relativeFilePath: '.',
                id: this.getOrSetID(childClazz),
                componentClass: childClazz,
                isDefault: childClazz === this.root
            })
        })
        return children
    }
    private getOrSetID (componentClass: ComponentConstructor<{}, {}>): string {
        if (!this.cids.has(componentClass)) this.cids.set(componentClass, getComponentClassID(this.id++))
        return this.cids.get(componentClass)!
    }
}
