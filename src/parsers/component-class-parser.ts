import debugFactory from 'debug'
import { ComponentConstructor, defineComponent, ANode } from 'san'
import { DynamicSanSourceFile } from '../models/san-source-file'
import { DynamicComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { isComponentLoader, ComponentClass } from '../models/component'
import { parseAndNormalizeTemplate } from './parse-template'
import { componentID, DynamicComponentReference } from '../models/component-reference'

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
        const stack: DynamicComponentReference[] = [
            new DynamicComponentReference('.', '' + this.id++, this.root)
        ]
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
        const trimWhitespace = getMember<'none' | 'blank' | 'all'>(componentClass, 'trimWhitespace')
        const delimiters = getMember<[string, string]>(componentClass, 'delimiters')
        const rootANode = parseAndNormalizeTemplate(template, { trimWhitespace, delimiters })
        const childComponents = this.getChildComponentClasses(componentClass)

        return new DynamicComponentInfo(id, rootANode, childComponents, componentClass)
    }

    /**
     * 从组件 class 得到子组件 class
     */
    getChildComponentClasses (parentComponentClass: ComponentClass): Map<string, DynamicComponentReference> {
        const children: Map<string, DynamicComponentReference> = new Map()

        const components: { [key: string]: ComponentConstructor<{}, {}> } = getMember(parentComponentClass, 'components', {})
        for (const [tagName, componentClass] of Object.entries(components)) {
            // 可能是空，例如 var Foo = defineComponent({components: {foo: Foo}})
            children.set(tagName, new DynamicComponentReference(
                '.',
                componentID(componentClass === this.root, () => this.getOrSetID(componentClass)),
                componentClass
            ))
        }
        return children
    }

    private getOrSetID (componentClass: ComponentConstructor<{}, {}>): string {
        if (!this.cids.has(componentClass)) this.cids.set(componentClass, String(this.id++))
        return this.cids.get(componentClass)!
    }
}
