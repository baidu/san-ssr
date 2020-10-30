import type { SanComponentConfig, ANode } from 'san'
import { parseAndNormalizeTemplate } from '../parsers/parse-template'
import type { ClassDeclaration } from 'ts-morph'
import { Node } from 'estree'
import { ComponentReference, DynamicComponentReference } from './component-reference'
import { getObjectLiteralPropertyKeys } from '../utils/ts-ast-util'
import { assertObjectExpression, getLiteralValue, getPropertiesFromObject, getStringArrayValue } from '../utils/js-ast-util'
import { ComponentClass } from './component'

export type TagName = string
type TrimWhitespace = 'none' | 'blank' | 'all' | undefined

export interface ComponentInfo {
    id: string,
    root: ANode,
    childComponents: Map<TagName, ComponentReference>
    hasMethod (name: string): boolean
    initData?(): any,
    getComputedNames (): string[]
    getFilterNames (): string[]
}

/**
 * 提供一个组件信息的封装，包括：
 * - computed name 列表、filters name 列表、root ANode
 * - 从 TypeScript 来的还有 sourceFile、classDeclaration 等
 *
 * Note：这里只是存数据，它的创建由具体 parser 负责
 */
abstract class ComponentInfoImpl<R extends ComponentReference = ComponentReference> {
    constructor (
        /**
         * 见 component-reference.ts 的说明
         */
        public readonly id: string,
        public readonly root: ANode,
        public readonly childComponents: Map<TagName, R>
    ) {}

    abstract hasMethod (name: string): boolean
    abstract getComputedNames (): string[]
    abstract getFilterNames (): string[]
}

export class DynamicComponentInfo extends ComponentInfoImpl<DynamicComponentReference> implements ComponentInfo {
    /**
     * 归一化的 proto。
     *
     * 确保 computed 等属性都出现在 proto 上，
     * 用于 compileToRenderer() 和 compileToSource()
     */
    public readonly proto: SanComponentConfig<{}, {}>
    constructor (
        id: string,
        root: ANode,
        childComponents: Map<TagName, DynamicComponentReference>,
        public readonly componentClass: ComponentClass
    ) {
        super(id, root, childComponents)
        this.proto = Object.assign(componentClass.prototype, componentClass)
    }

    initData () {
        return this.proto.initData ? this.proto.initData.call({}) : {}
    }

    hasMethod (name: string) {
        return !!this.proto[name]
    }

    getComputedNames () {
        return Object.keys(this.proto.computed || {})
    }

    getFilterNames () {
        return Object.keys(this.proto.filters || {})
    }
}

export class JSComponentInfo extends ComponentInfoImpl<ComponentReference> {
    public readonly className: string
    public readonly sourceCode: string
    private readonly properties: Map<string, Node>
    constructor (
        id: string,
        className: string,
        properties: Map<string, Node>,
        sourceCode: string
    ) {
        const template = properties.has('template') ? getLiteralValue(properties.get('template')!) as string : ''
        const trimWhitespace: TrimWhitespace = properties.has('trimWhitespace') ? getLiteralValue(properties.get('trimWhitespace')!) : undefined
        const delimiters = properties.has('delimiters') ? getStringArrayValue(properties.get('delimiters')!) as [string, string] : undefined
        const root = parseAndNormalizeTemplate(template, { trimWhitespace, delimiters })

        super(id, root, new Map())
        this.className = className
        this.properties = properties
        this.sourceCode = sourceCode
    }

    hasMethod (name: string) {
        return this.properties.has(name)
    }

    getComputedNames (): string[] {
        return this.getObjectPropertyKeys('computed')
    }

    getFilterNames () {
        return this.getObjectPropertyKeys('filters')
    }

    * getComponentsDelcarations (): Generator<[string, Node]> {
        const expr = this.properties.get('components')
        if (!expr) return
        assertObjectExpression(expr)
        yield * getPropertiesFromObject(expr)
    }

    private getObjectPropertyKeys (propertyName: string) {
        const obj = this.properties.get(propertyName)
        if (!obj) return []
        assertObjectExpression(obj)
        return [...getPropertiesFromObject(obj)].map(([key]) => key)
    }
}

export class TypedComponentInfo extends ComponentInfoImpl implements ComponentInfo {
    private computedNames: string[]
    private filterNames: string[]
    constructor (
        id: string,
        root: ANode,
        childComponents: Map<TagName, ComponentReference>,
        public readonly classDeclaration: ClassDeclaration
    ) {
        super(id, root, childComponents)
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
