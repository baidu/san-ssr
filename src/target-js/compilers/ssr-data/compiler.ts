import {
    parse as parseToAst, CallExpression, Node, Identifier,
    ClassDeclaration, Program, ObjectExpression, MethodDefinition
} from 'acorn'
import walk from 'acorn-walk'
import { generate } from 'astring'
import {
    isAssignmentExpression, isExpressionStatement, isFunctionExpression,
    isIdentifier, isMemberExpression, isMethodDefinition, isObjectExpression,
    isPropertyDefinition, getDefinedComponentName, removeDefineComponent,
    isBlockStatement,
    isProgram,
    isSpreadElement,
    isLiteral,
    isTemplateLiteralString
} from './acorn-utils'
import { ANode } from 'san'
import { ComponentInfo, DataTransformer, MethodFunction } from './transformer'
import createDebugger from 'debug'
const debug = createDebugger('ssr-data-transform')

function createDefineComponentInfo (
    root: ObjectExpression, componentName?: string, templateAst?: ANode): ComponentInfo {
    const component: ComponentInfo = {
        type: 'defineComponent',
        isDynamic: false,
        componentName,
        templateAst,
        componentRoot: root,
        methods: {}
    }
    root.properties.map(prop => {
        if (isSpreadElement(prop)) {
            throw new Error('Spread element in defineComponent is not supported.')
        } else {
            if (prop.computed) {
                component.isDynamic = true
            }
            if (!prop.computed && isIdentifier(prop.key)) {
                if (prop.key.name === 'computed' || prop.key.name === 'filters') {
                    if (isObjectExpression(prop.value)) {
                        component[prop.key.name] = prop.value
                    } else {
                        component.isDynamic = true
                    }
                } else if (prop.key.name === 'template') {
                    if (isLiteral(prop.value) || isTemplateLiteralString(prop.value)) {
                        component.template = prop.value
                    } else {
                        component.isDynamic = true
                    }
                }
                if (isFunctionExpression(prop.value)) {
                    (prop.value as MethodFunction)._methodType = 'property'
                    component.methods[prop.key.name] = prop.value as MethodFunction
                }
            }
        }
    })

    return component
}

export interface TransformComponentInfo {
    templateAst?: ANode
}

export type TransformOptions = {
    /** 是否移除未使用方法 */
    minifyMethods?: boolean
} & ({
    /**
     * typescript 组件源码类型，class A extends san.Component {}
     */
    sourceType: 'class';
    componentInfos: Record<string, TransformComponentInfo>
} | {
    /**
     * javascript 组件源码类型， 单个 defineComponent({}) 定义
     */
    sourceType: 'defineComponent'
    componentInfo: TransformComponentInfo
} | {
    /**
     * javascript 组件源码类型， 混合 class A extends san.Component {} 和 defineComponent({})
     * 如果 defineComponent({}) 是匿名定义（module.exports = defineComponent({})），会被移除。
     */
    sourceType: 'mixed'
    componentInfos: Record<string, TransformComponentInfo>
})

function parseComponents (ast: Node, componentInfos: Record<string, TransformComponentInfo>) {
    const definedComponentsToRemove: CallExpression[] = []
    const parsedComponents: ComponentInfo[] = []
    const parsedComponentsMap: Record<string, ComponentInfo> = {}
    walk.ancestor(ast, {
        ClassDeclaration: (node, ancestors: Node[]) => {
            const classDecl = node as ClassDeclaration
            // class MyComponent extends san.Component {}
            if (isIdentifier(classDecl.id) && classDecl.superClass && componentInfos[classDecl.id.name]) {
                const componentName = classDecl.id.name
                const component: ComponentInfo = {
                    type: 'class' as const,
                    componentName,
                    templateAst: componentInfos[componentName].templateAst,
                    componentRoot: classDecl,
                    isDynamic: false,
                    methods: (classDecl.body.body.filter(
                        m => isMethodDefinition(m) && isIdentifier(m.key)) as MethodDefinition[])
                        .reduce((map, m) => {
                            (m.value as MethodFunction)._methodType = 'method'
                            map[(m.key as Identifier).name] = m.value as MethodFunction
                            return map
                        }, {} as Record<string, MethodFunction>)
                }
                // extract computed and filters
                for (const prop of classDecl.body.body) {
                    if (isPropertyDefinition(prop) && !prop.computed && isIdentifier(prop.key)) {
                        if (isObjectExpression(prop.value!)) {
                            if (prop.key.name === 'computed') {
                                component.computed = prop.value
                            } else if (prop.key.name === 'filters') {
                                component.filters = prop.value
                            }
                        }
                        if (prop.static && prop.key.name === 'template') {
                            if (isLiteral(prop.value!) || isTemplateLiteralString(prop.value!)) {
                                component.template = prop.value!
                            } else {
                                component.isDynamic = true
                            }
                        }
                    }
                }

                parsedComponents.push(parsedComponentsMap[componentName] = component)

                const parent = ancestors[ancestors.length - 2]
                // find the top-level class members assignments
                if (isProgram(parent) || isBlockStatement(parent)) {
                    component.blockRoot = (parent as Program)
                    component.blockRoot.body.forEach(statment => {
                        if (isExpressionStatement(statment) && isAssignmentExpression(statment.expression) &&
                            isMemberExpression(statment.expression.left) &&
                            isIdentifier(statment.expression.left.property)) {
                            const left = statment.expression.left
                            const right = statment.expression.right
                            // MyComponent.computed = {...}
                            if (isIdentifier(left.object) && (componentInfos[left.object.name])) {
                                // MyComponent[abc] = ...
                                if (left.computed) {
                                    component.isDynamic = true
                                }
                                if (!left.computed && isIdentifier(left.property)) {
                                    if (left.property.name === 'computed' || left.property.name === 'filters') {
                                        if (isObjectExpression(right)) {
                                            const propName = left.property.name as 'computed' | 'filters'
                                            const className = left.object.name
                                            if (parsedComponentsMap[className]) {
                                                parsedComponentsMap[className][propName] = right
                                            }
                                        } else {
                                            component.isDynamic = true
                                        }
                                    } else if (left.property.name === 'template') {
                                        if (isLiteral(right) || isTemplateLiteralString(right)) {
                                            component.template = right
                                        } else {
                                            component.isDynamic = true
                                        }
                                    }
                                }
                            } else if (isMemberExpression(left.object) && isIdentifier(left.object.object) &&
                                (componentInfos[left.object.object.name]) &&
                                isIdentifier(left.object.property) && left.object.property.name === 'prototype') {
                                // MyComponent.prototype[abc] = ...
                                if (left.computed) {
                                    component.isDynamic = true
                                }
                                // MyComponent.prototype.computed = {...}
                                if (!left.computed && isIdentifier(left.property)) {
                                    if (left.property.name === 'computed' || left.property.name === 'filters') {
                                        if (isObjectExpression(right)) {
                                            const propName = left.property.name
                                            const className = left.object.object.name
                                            if (parsedComponentsMap[className]) {
                                                parsedComponentsMap[className][propName] = right
                                            }
                                        } else {
                                            component.isDynamic = true
                                        }
                                    }
                                }
                                // MyComponent.prototype.method = {...}
                                if (isIdentifier(left.property) && isFunctionExpression(right)) {
                                    const className = left.object.object.name
                                    if (parsedComponentsMap[className]) {
                                        (right as MethodFunction)._methodType = 'prototype-method'
                                        parsedComponentsMap[className].methods[
                                            left.property.name] = (right as MethodFunction)
                                    }
                                }
                            }
                        }
                    })
                }
            }
        },
        CallExpression: (callExpr: CallExpression, ancestors: Node[]) => {
            // defineComponent({...}) or san.defineComponent({...})
            if (
                (
                    isIdentifier(callExpr.callee) &&
                    callExpr.callee.name === 'defineComponent' &&
                    isObjectExpression(callExpr.arguments[0])
                ) ||
                (
                    isMemberExpression(callExpr.callee) &&
                    isIdentifier(callExpr.callee.object) && callExpr.callee.object.name === 'san' &&
                    isIdentifier(callExpr.callee.property) &&
                    callExpr.callee.property.name === 'defineComponent' &&
                    isObjectExpression(callExpr.arguments[0])
                )
            ) {
                const componentName = getDefinedComponentName(ancestors[ancestors.length - 2])
                // module.exports = defineComponent({...}) 匿名组件需要移除
                if (!componentName) {
                    definedComponentsToRemove.push(callExpr)
                }
                parsedComponents.push(createDefineComponentInfo(
                    callExpr.arguments[0] as ObjectExpression,
                    componentName,
                    componentInfos[componentName || 'default']?.templateAst))
            }
        }
    })
    return {
        parsedComponents,
        definedComponentsToRemove
    }
}

/**
 * 转换 san ssr 组件中的数据访问代码 this.data, this.d
 * - this.d.xxx -> this.data.raw.xxx
 * - this.d.computed -> this.data.get('computed')
 * - this.data.get('xxx) -> this.data.raw.xxx
 * - this.data.set('xxx', value) -> this.data.raw.xxx = value
 *
 * __部分符合条件的组件会做代码精简，移除无用的函数和属性。__
 * @param code
 * @returns
 */
export function transformDataProxy (code: string, options: TransformOptions): { transformed?: number, code: string } {
    let ast: Program
    try {
        ast = parseToAst(code, { ecmaVersion: 2022, sourceType: 'module' }) as Program
    } catch (e) {
        console.warn('Failed to parse source code to AST:', code, (e as Error).message)
        return { code }
    }

    const componentInfos = options.sourceType === 'defineComponent'
        ? { default: options.componentInfo }
        : options.componentInfos
    // mixed 不一定存在 componentInfos
    if (options.sourceType !== 'mixed' && Object.keys(componentInfos).length === 0) {
        return { code }
    }

    const { parsedComponents, definedComponentsToRemove } = parseComponents(ast, componentInfos)
    if (!parsedComponents.length && !definedComponentsToRemove.length) {
        return { code }
    }

    let transformedCount = 0
    // sourceType = mixed 需要移除 san.defineComponent() 定义
    if (options.sourceType === 'mixed') {
        transformedCount += removeDefineComponent(definedComponentsToRemove)
    }

    for (const component of parsedComponents) {
        debug('transformDataProxy', {
            componentName: component.componentName,
            sourceType: component.type,
            methods: Object.keys(component.methods)
        })
        const transformer = new DataTransformer(component)
        transformer.transform()
        if (options.minifyMethods !== false) {
            transformer.minifyMethods()
        }
        transformedCount += transformer.getTransformedCount()
    }

    if (!transformedCount) {
        return { code }
    }

    code = generate(ast).trim()
    if (code.endsWith(';')) {
        code = code.slice(0, -1)
    }
    return {
        transformed: transformedCount,
        code
    }
}
