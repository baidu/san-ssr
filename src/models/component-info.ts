/**
 * 组件信息
 *
 * 概念：每个 San 组件都对应一个 ComponentInfo。
 *
 * 关系：通常通过 src/parsers 下的解析器从 SSR 的输入得到 SanSourceFile。
 * 一个 SanSourceFile 中可能包含若干个 ComponentInfo。
 *
 * 类型：对于 TS 源码输入，解析得到的是 TypedComponentInfo，
 * 对于其他输入，解析得到的是 JSComponentInfo。
 */
import type { ANode, Component, ComponentDefineOptions } from 'san'
import { FunctionCall, FunctionDefinition } from '../ast/renderer-ast-dfn'
import { parseAndNormalizeTemplate } from '../parsers/parse-template'
import type { ClassDeclaration } from 'ts-morph'
import { Node } from 'estree'
import { visitANodeRecursively } from '../ast/san-ast-util'
import { ComponentReference, DynamicComponentReference } from './component-reference'
import { getObjectLiteralPropertyKeys } from '../ast/ts-ast-util'
import {
    assertObjectExpression, getLiteralValue, getPropertiesFromObject, getStringArrayValue
} from '../ast/js-ast-util'
import type { RenderOptions } from '../compilers/renderer-options'
import { RendererCompiler } from '../compilers/renderer-compiler'
import { isATextNode } from '../ast/san-ast-type-guards'

export type TagName = string
type TrimWhitespace = 'none' | 'blank' | 'all' | undefined

export type ComponentType = 'normal' | 'template'

/**
 * 所有类型的 ComponentInfo，都需要实现如下接口
 */
export interface ComponentInfo {
    id: string
    root: ANode
    childComponents: Map<TagName, ComponentReference>
    componentType: ComponentType
    hasMethod (name: string): boolean
    getComputedNames (): string[]
    getFilterNames (): string[]
    hasDynamicComponent (): boolean
    compileToRenderer (options: RenderOptions): FunctionDefinition | FunctionCall
}

/**
 * 提供一个组件信息的封装，包括：
 * - computed name 列表、filters name 列表、root ANode
 * - 从 TypeScript 来的还有 sourceFile、classDeclaration 等
 *
 * 注意：
 * - 这里只是存数据，它的创建由具体 parser 负责
 * - 这个工具类只为了方便实现具体的 ComponentInfo，不暴露作为接口
 */
abstract class ComponentInfoImpl<R extends ComponentReference = ComponentReference> {
    constructor (
        /**
         * 见 component-reference.ts 的说明
         */
        public readonly id: string,
        public readonly root: ANode,
        public readonly childComponents: Map<TagName, R>,
        public readonly componentType: ComponentType
    ) {}

    abstract hasMethod (name: string): boolean
    abstract getComputedNames (): string[]
    abstract getFilterNames (): string[]
    hasDynamicComponent (): boolean {
        let found = false
        visitANodeRecursively(this.root, (node) => {
            if (!isATextNode(node) && node.directives && node.directives.is) found = true
        })
        return found
    }

    compileToRenderer (options: RenderOptions): FunctionDefinition | FunctionCall {
        return new RendererCompiler(options).compileToRenderer(this)
    }
}

export class DynamicComponentInfo extends ComponentInfoImpl<DynamicComponentReference> implements ComponentInfo {
    /**
     * 归一化的 proto。
     *
     * 确保 computed 等属性都出现在 proto 上，
     * 用于 compileToRenderer() 和 compileToSource()
     */
    public readonly proto: Component<{}> & ComponentDefineOptions
    constructor (
        id: string,
        root: ANode,
        childComponents: Map<TagName, DynamicComponentReference>,
        componentType: ComponentType,
        public readonly componentClass: Component
    ) {
        super(id, root, childComponents, componentType)
        this.proto = Object.assign(componentClass.prototype, componentClass)
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
    public readonly isRawObject: boolean
    private readonly properties: Map<string, Node>
    constructor (
        id: string,
        className: string,
        properties: Map<string, Node>,
        sourceCode: string,
        componentType: ComponentType = 'normal',
        isRawObject: boolean = false
    ) {
        const template = properties.has('template') ? getLiteralValue(properties.get('template')!) as string : ''
        const trimWhitespace: TrimWhitespace = properties.has('trimWhitespace')
            ? getLiteralValue(properties.get('trimWhitespace')!) : undefined
        const delimiters = properties.has('delimiters')
            ? getStringArrayValue(properties.get('delimiters')!) as [string, string] : undefined
        const root = parseAndNormalizeTemplate(template, { trimWhitespace, delimiters })

        super(id, root, new Map(), componentType)
        this.className = className
        this.properties = properties
        this.sourceCode = sourceCode
        this.isRawObject = isRawObject
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
        public readonly classDeclaration: ClassDeclaration,
        componentType: ComponentType = 'normal'
    ) {
        super(id, root, childComponents, componentType)
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
