/**
 * ComponentClass 解析器
 *
 * 从根 ComponentClass 递归搜索和解析所有 ComponentClass，
 * 形成**单个** SanSourceFile 实例，包含所有的 ComponentInfo 列表。
 */
import { ComponentConstructor, defineComponent } from 'san'
import { DynamicSanSourceFile } from '../models/san-source-file'
import { DynamicComponentInfo } from '../models/component-info'
import { getMember } from '../utils/lang'
import { isComponentLoader } from '../models/component'
import type { ComponentClass } from '../models/component'
import { parseAndNormalizeTemplate } from './parse-template'
import { componentID, DynamicComponentReference } from '../models/component-reference'
import { COMPONENT_REFERENCE } from '../helpers/markExternalComponent'

/*
 * ComponentClass 解析器
 *
 * 每个组件树对应一个 parser 实例，如果要解析新的组件树，请创建新的 parser 实例。
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
        const rootId = getMember(this.root, 'id')
        const stack: DynamicComponentReference[] = [
            new DynamicComponentReference('.', typeof rootId === 'string' ? rootId : '' + this.id++, this.root)
        ]
        const parsed = new Set()
        while (stack.length) {
            const { id, componentClass } = stack.pop()!
            if (parsed.has(componentClass)) continue
            else parsed.add(componentClass)

            const info = this.createComponentInfoFromComponentClass(componentClass, id)
            // 先序遍历，结果列表中第一个为根
            componentInfos.push(info)
            for (const child of info.childComponents.values()) {
                if (child.specifier === '.') {
                    stack.push(child)
                }
            }
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
        if (typeof componentClass === 'object') {
            componentClass = defineComponent(componentClass)
        }
        if (!componentClass) componentClass = defineComponent({ template: '' })

        const template = getMember(componentClass, 'template', '')
        const trimWhitespace = getMember<'none' | 'blank' | 'all'>(componentClass, 'trimWhitespace')
        const delimiters = getMember<[string, string]>(componentClass, 'delimiters')
        const rootANode = parseAndNormalizeTemplate(template, { trimWhitespace, delimiters })
        const childComponents = this.getChildComponentClasses(componentClass, id)

        return new DynamicComponentInfo(id, rootANode, childComponents, componentClass)
    }

    /**
     * 从组件 class 得到子组件 class
     */
    getChildComponentClasses (parentComponentClass: ComponentClass, selfId: string): Map<string, DynamicComponentReference> {
        const children: Map<string, DynamicComponentReference> = new Map()

        const components: { [key: string]: ComponentConstructor<{}, {}> | undefined } = getMember(parentComponentClass, 'components', {})
        for (const [tagName, componentClass] of Object.entries(components)) {
            if (!componentClass) {
                continue
            }

            // 'self' 指定组件为自身
            // 用法见 https://baidu.github.io/san/tutorial/component/#components
            if (typeof componentClass === 'string' && componentClass === 'self') {
                children.set(tagName, new DynamicComponentReference(
                    '.',
                    selfId,
                    parentComponentClass
                ))
                continue
            }

            // 外部组件
            if (componentClass[COMPONENT_REFERENCE]) {
                children.set(tagName, componentClass[COMPONENT_REFERENCE])
                continue
            }

            // 可能是空，例如 var Foo = defineComponent({components: {foo: Foo}})
            children.set(tagName, new DynamicComponentReference(
                '.',
                componentID(componentClass === this.root, () => this.getOrSetID(componentClass)),
                componentClass
            ))
        }
        return children
    }

    /**
     * 由于拿到的是类，并不知道每个递归到的 Class 是从哪个文件来的，
     * 因此生成一个递增的 id 来标识它。
     */
    private getOrSetID (componentClass: ComponentConstructor<{}, {}>): string {
        if (!this.cids.has(componentClass)) {
            const id = getMember(componentClass, 'id')
            this.cids.set(componentClass, typeof id === 'string' ? id : String(this.id++))
        }
        return this.cids.get(componentClass)!
    }
}
