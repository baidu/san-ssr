import { SanComponent, ANode, ComponentConstructor } from 'san'
import { ClassDeclaration } from 'ts-morph'
import { ComponentReference, DynamicComponentReference } from './component-reference'
import { getObjectLiteralPropertyKeys } from '../utils/ast-util'

export type TagName = string

/**
 * 提供一个组件信息的封装，包括：
 * - computed name 列表、filters name 列表、template、root ANode
 * - 从 TypeScript 来的还有 sourceFile、classDeclaration 等
 *
 * Note：这里只是存数据，它的创建由具体 parser 负责
 */
export abstract class ComponentInfoImpl<R extends ComponentReference = ComponentReference> {
    /**
     * 归一化的 proto。
     *
     * 确保 computed、template 等属性都出现在 proto 上，
     * 用于 compileToRenderer() 和 compileToSource()
     */
    constructor (
        /**
         * 见 component-reference.ts 的说明
         */
        public readonly id: string,
        public readonly template: string,
        public readonly root: ANode,
        public readonly childComponents: Map<TagName | ANode, R>
    ) {}

    abstract hasMethod (name: string): boolean
    abstract getComputedNames (): string[]
    abstract getFilterNames (): string[]

    getChildComponentRenference (aNode: ANode): R | undefined {
        return this.childComponents.get(aNode) || this.childComponents.get(aNode.tagName)
    }
}

export class DynamicComponentInfo extends ComponentInfoImpl<DynamicComponentReference> {
    public readonly proto: SanComponent<{}>
    constructor (
        id: string,
        template: string,
        root: ANode,
        childComponents: Map<TagName | ANode, DynamicComponentReference>,
        public readonly componentClass: ComponentConstructor<{}, {}>
    ) {
        super(id, template, root, childComponents)
        this.proto = Object.assign(componentClass.prototype, componentClass)
    }
    hasMethod (name: string) {
        return !!this.proto[name]
    }
    getComputedNames () {
        return Object.keys(this.proto['computed'] || {})
    }
    getFilterNames () {
        return Object.keys(this.proto['filters'] || {})
    }
}

export class TypedComponentInfo extends ComponentInfoImpl {
    private computedNames: string[]
    private filterNames: string[]
    constructor (
        id: string,
        template: string,
        root: ANode,
        childComponents: Map<TagName | ANode, ComponentReference>,
        public readonly classDeclaration: ClassDeclaration
    ) {
        super(id, template, root, childComponents)
        this.computedNames = getObjectLiteralPropertyKeys(this.classDeclaration, 'computed')
        this.filterNames = getObjectLiteralPropertyKeys(this.classDeclaration, 'filters')
    }
    hasMethod (name: string) {
        return !!this.classDeclaration.getMethod(name)
    }
    getComputedNames () {
        return this.computedNames
    }
    getFilterNames () {
        return this.filterNames
    }
}

export type ComponentInfo = TypedComponentInfo | DynamicComponentInfo

export function isTypedComponentInfo (componentInfo: ComponentInfo): componentInfo is TypedComponentInfo {
    return componentInfo['classDeclaration']
}
