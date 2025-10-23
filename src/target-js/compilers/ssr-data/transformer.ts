import {
    CallExpression, MemberExpression, Node, Identifier,
    ThisExpression, Literal, Expression, TemplateLiteral,
    ClassDeclaration, FunctionExpression, ObjectExpression, Property,
    BlockStatement,
    Program
} from 'acorn'
import walk from 'acorn-walk'
import { generate } from 'astring'
import type { ANode } from 'san'
import {
    isAssignmentExpression, isCallExpression, isFunctionExpression,
    isIdentifier, isLiteral, isMemberExpression, isMethodDefinition,
    isProperty, isPropertyDefinition, isSpreadElement,
    replaceNode, createPropertyChain, findThisMethodCalls,
    createTemplateElement, createThisDataNode, createThisDataRawNode,
    createLiteral, createProperty, createPropertyDiffinition, createAssignment,
    isExpressionStatement,
    isTemplateLiteralString
} from './acorn-utils'
import { getANodeExprCalls } from './san-utils'
import createDebugger from 'debug'
import { DYNAMIC_THIS_FLAG } from '../../../compilers/reserved-names'

const debug = createDebugger('ssr-data-transform')

/**
 * 移除的 hooks
 */
const DISCARDED_HOOKS = new Set([
    'created',
    'attached',
    'detached',
    'disposed',
    'updated'
])

interface ProxyDataNode {
    thisDNode: MemberExpression
    // represents the property access path: [property, Computed][]
    propertyPaths: {property: Expression, parent: MemberExpression}[]
    // is data set operation
    isDataSet: boolean
}
interface DataNode {
    thisDataNode: MemberExpression
    // represents the property access path: [property, Computed][]
    callNode: CallExpression
    // is data set operation
    isDataSet: boolean
}

function transformPropertyPath (prop: ProxyDataNode['propertyPaths'][0]): Literal | TemplateLiteral {
    if (!prop.parent.computed) {
        return createLiteral((prop.property as Identifier).name)
    }
    const templateLiteral: TemplateLiteral = {
        type: 'TemplateLiteral',
        quasis: [createTemplateElement(''), createTemplateElement('')],
        expressions: [prop.property],
        start: 0,
        end: 0
    }
    templateLiteral.quasis[templateLiteral.quasis.length - 1].tail = true
    return templateLiteral
}

function transformProxyDataNode (
    dataNode: ProxyDataNode,
    computedNames: Set<string>,
    transformDataSet: boolean
): boolean {
    if (!dataNode.isDataSet) {
        // transform this.d to this.data.raw
        if (!dataNode.propertyPaths.length) {
            const dataRawExpr = createThisDataRawNode()
            replaceNode(dataNode.thisDNode, dataRawExpr)
            return true
        } else {
            // this.d[xxx].xxx to this.data.get("${xxx}"), this.d.computed to this.data.get('computed')
            if (dataNode.propertyPaths[0].parent.computed ||
                computedNames.has((dataNode.propertyPaths[0].property as Identifier).name)) {
                const getCallExpr = createThisDataNode('get', [transformPropertyPath(dataNode.propertyPaths[0])!])
                replaceNode(dataNode.propertyPaths[0].parent, getCallExpr)
                return true
            } else {
                const dataRawExpr = createThisDataRawNode()
                replaceNode(dataNode.thisDNode, dataRawExpr)
                return true
            }
        }
    } else if (transformDataSet) {
        // this.d.xxx = value to this.data.raw.xxx = value
        const dataRawExpr = createThisDataRawNode()
        replaceNode(dataNode.thisDNode, dataRawExpr)
        return true
    }
    return false
}

function transformGetSetDataNode (
    dataNode: DataNode,
    computedNames: Set<string>,
    transformDataSet: boolean
): boolean {
    const [pathNode, valueNode] = dataNode.callNode.arguments
    if (!pathNode && !dataNode.isDataSet) {
        // this.data.get() to this.data.raw
        replaceNode(dataNode.callNode, createThisDataRawNode())
        return true
    }
    if (isLiteral(pathNode) && typeof pathNode.value === 'string') {
        const pathParts = String(pathNode.value).split('.')
        const dataRawExpr = createThisDataRawNode()
        if (!dataNode.isDataSet) {
            // this.data.get('a.b.c') to this.data.raw.a?.b?.c
            if (!computedNames.has(pathParts[0])) {
                replaceNode(dataNode.callNode, createPropertyChain(dataRawExpr, pathParts))
                return true
            }
        } else if (transformDataSet && pathParts.length === 1 && valueNode) {
            // this.data.set('a', value) to this.data.raw.a = value
            const memberExpr: MemberExpression = createPropertyChain(dataRawExpr, pathParts)
            replaceNode(dataNode.callNode, createAssignment(memberExpr, valueNode as Expression))
            return true
        }
    }
    return false
}

export interface MethodFunction extends FunctionExpression {
    /**
     * - property: defineComponent 中的方法类型
     * - method: class 中的方法类型
     * - prototype-method: class.prototype.method = function () {} 中的方法类型
     */
    _methodType: 'property' | 'method' | 'prototype-method'
}

interface BaseComponentInfo {
    templateAst?: ANode
    methods: Record<string, MethodFunction>
    computed?: ObjectExpression
    filters?: ObjectExpression
    template?: Expression
    /**
     * 是否动态组件，即无法静态分析的组件
     * class A{} A.prototype[abc] = ...
     * defineComponent({ [abc]: function () {} })
     */
    isDynamic: boolean
}
interface ClassComponentInfo extends BaseComponentInfo {
    type: 'class'
    componentName: string
    componentRoot: ClassDeclaration
    /** 设置 blockRoot 用于移除 prototype 中的方法 */
    blockRoot?: Program | BlockStatement
}

interface DefineComponentInfo extends BaseComponentInfo {
    type: 'defineComponent'
    componentName?: string
    componentRoot: ObjectExpression
}

export type ComponentInfo = ClassComponentInfo | DefineComponentInfo

export class DataTransformer<T extends ComponentInfo> {
    /**
     * 组件中是否存在动态 this 访问（this[xxx], var self = this）
     */
    private hasDymamicThis = false
    /**
     * 存在 ssr 调用的 方法
     * */
    private calledMethods = new Set<string>()
    /** computed, filters 中调用的方法 */
    private computedFiltersCalledMethods = new Set<string>()
    /** computed 字段名 */
    private computedNames = new Set<string>()
    /** 转换计数，包含转换 this.d, this.data, 移除 method 等  */
    private transformedCount = 0

    constructor (private component: T) {}

    private transformFunction (root: FunctionExpression, computedNames: Set<string>, transformDataSet: boolean) {
        let skeepCount = 0
        walk.ancestor(root, {
            ThisExpression: (node: ThisExpression, ancestors: Node[]) => {
                if (ancestors.some(n => isFunctionExpression(n) && n !== root)) {
                    if (!skeepCount++) {
                        console.info('Skipped transforming this expression in nested function: ', generate(root))
                    }
                    return
                }
                const parent = ancestors[ancestors.length - 2]
                if (isMemberExpression(parent) && parent.object === node) {
                    if (isIdentifier(parent.property) && parent.property.name === 'd') {
                        let thisMemberNode: MemberExpression = parent
                        let isDataSet = false
                        const propertyPaths: ProxyDataNode['propertyPaths'] = []
                        for (let i = ancestors.length - 3; i >= 0; i--) {
                            const ancestor = ancestors[i]
                            // get this.d.a.b.c
                            if (isMemberExpression(ancestor) && ancestor.object === thisMemberNode) {
                                thisMemberNode = ancestor as MemberExpression
                                propertyPaths.push({
                                    property: thisMemberNode.property as Expression,
                                    parent: thisMemberNode
                                })
                                // set this.d.a.b.c = value
                            } else if (isAssignmentExpression(ancestor) && ancestor.left === thisMemberNode) {
                                isDataSet = true
                                break
                            }
                        }

                        if (transformProxyDataNode({
                            thisDNode: parent,
                            propertyPaths,
                            isDataSet
                        }, computedNames, transformDataSet)) {
                            this.transformedCount++
                        }
                    } else if ((isIdentifier(parent.property) && parent.property.name === 'data')) {
                        const methodNode = ancestors[ancestors.length - 3]
                        const callNode = ancestors[ancestors.length - 4]
                        if (isCallExpression(callNode) && isMemberExpression(methodNode) &&
                            methodNode.object === parent) {
                            if ((isIdentifier(methodNode.property) &&
                                (methodNode.property.name === 'get' || methodNode.property.name === 'set'))) {
                                // this.data.get(...) or this.data.set(...)
                                if (transformGetSetDataNode({
                                    thisDataNode: parent,
                                    callNode,
                                    isDataSet: methodNode.property.name === 'set'
                                }, computedNames, transformDataSet)) {
                                    this.transformedCount++
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    private transformComputed (props: ObjectExpression) {
        props.properties.forEach(prop => {
            if (isFunctionExpression((prop as Property).value)) {
                const res = findThisMethodCalls((prop as Property).value as FunctionExpression)
                res.methodNames.forEach(name => this.computedFiltersCalledMethods.add(name))
                if (res.hasDymamicThis) {
                    this.hasDymamicThis = true
                }
                this.transformFunction((prop as Property).value as FunctionExpression, this.computedNames, false)
            }
        })
    }

    private transformMethodCalls () {
        const initCalls = new Set<string>();
        (this.component.templateAst
            ? getANodeExprCalls(this.component.templateAst).calls
            : []).forEach(i => initCalls.add(i))
        this.computedFiltersCalledMethods.forEach(i => initCalls.add(i));
        ['constructor', 'inited', 'initData'].forEach(method => {
            // eslint-disable-next-line no-prototype-builtins
            if (this.component.methods.hasOwnProperty(method)) {
                initCalls.add(method)
            }
        })

        if (!initCalls.size) {
            return
        }

        const methodNames = new Set(Object.keys(this.component.methods))
        const visitedMethods = new Set<string>()
        const visitMethod = (methodName: string) => {
            visitedMethods.add(methodName)
            const method = this.component.methods[methodName]
            const res = findThisMethodCalls(method as FunctionExpression)
            if (res.hasDymamicThis) {
                this.hasDymamicThis = true
            }
            res.methodNames.forEach(name => {
                if (methodNames.has(name) && !visitedMethods.has(name)) {
                    visitMethod(name)
                }
            })
        }
        for (const methodName of initCalls) {
            if (methodNames.has(methodName)) {
                visitMethod(methodName)
            }
        }
        this.calledMethods = visitedMethods
        for (const methodName of (this.hasDymamicThis ? methodNames : visitedMethods)) {
            this.transformFunction(
                this.component.methods[methodName] as FunctionExpression, this.computedNames, true)
        }
    }

    private removeMethods () {
        const methodsKept = new Set<string>(this.calledMethods)
        methodsKept.add('constructor')
        methodsKept.add('initData')
        methodsKept.add('inited')

        if (this.component.type === 'class') {
            const classDecl = this.component.componentRoot as ClassDeclaration
            classDecl.body.body = classDecl.body.body.filter(m => {
                if (isMethodDefinition(m) && isIdentifier(m.key)) {
                    if (methodsKept.has(m.key.name)) {
                        return true
                    }
                    // 移除不需要的 method
                    this.transformedCount++
                    return false
                }
                return true
            })
            // 移除 MyClass.prototype.method = function () {}
            const prototypeMethodsToRemove = new Set(Object.entries(this.component.methods)
                .map(([methodName, method]) => {
                    if (!methodsKept.has(methodName) && method._methodType === 'prototype-method') {
                        return method
                    }
                    return null
                }).filter(node => node) as MethodFunction[])
            if (prototypeMethodsToRemove.size > 0 && this.component.blockRoot) {
                this.component.blockRoot.body = this.component.blockRoot.body.filter(statement => {
                    if (isExpressionStatement(statement) &&
                        isAssignmentExpression(statement.expression) &&
                        prototypeMethodsToRemove.has(statement.expression.right as MethodFunction)) {
                        this.transformedCount++
                        return false
                    }
                    return true
                })
            }
        } else if (this.component.type === 'defineComponent') {
            const body = this.component.componentRoot as ObjectExpression
            body.properties = body.properties.filter(prop => {
                if (isIdentifier((prop as Property).key) && isFunctionExpression((prop as Property).value)) {
                    if (methodsKept.has(((prop as Property).key as Identifier).name)) {
                        return true
                    }
                    // 移除不需要的 method
                    this.transformedCount++
                    return false
                }
                return true
            })
        }
    }

    private cleanupDiscardedMembers () {
        if (this.component.type === 'class') {
            const classDecl = this.component.componentRoot as ClassDeclaration
            classDecl.body.body = classDecl.body.body.filter(m => {
                if (isMethodDefinition(m) && !m.computed && isIdentifier(m.key) && DISCARDED_HOOKS.has(m.key.name) &&
                    !this.calledMethods.has(m.key.name)) {
                    this.transformedCount++
                    return false
                }
                // 仅移除静态 template
                if (isPropertyDefinition(m) && !m.computed && m.static &&
                    isIdentifier(m.key) && m.key.name === 'template' &&
                    (isLiteral(m.value!) || isTemplateLiteralString(m.value!))) {
                    this.transformedCount++
                    return false
                }
                return true
            })
            if (isLiteral(this.component.template!) && this.component.blockRoot) {
                // 移除 class 外的 MyClass.template = '...'
                this.component.blockRoot.body = this.component.blockRoot.body.filter(statement => {
                    if (isExpressionStatement(statement) &&
                        isAssignmentExpression(statement.expression) &&
                        this.component.template === statement.expression.right) {
                        this.transformedCount++
                        return false
                    }
                    return true
                })
            }
        } else if (this.component.type === 'defineComponent') {
            const body = this.component.componentRoot as ObjectExpression
            body.properties = body.properties.filter(prop => {
                if (isProperty(prop) && !prop.computed && isIdentifier(prop.key)) {
                    if (isFunctionExpression(prop.value) &&
                        DISCARDED_HOOKS.has(prop.key.name) && !this.calledMethods.has(prop.key.name)) {
                        this.transformedCount++
                        return false
                    }
                    if (prop.key.name === 'template' &&
                        (isLiteral(prop.value) || isTemplateLiteralString(prop.value))) {
                        this.transformedCount++
                        return false
                    }
                }
                return true
            })
        }
    }

    private setDynamicThisFlag () {
        this.transformedCount++
        if (this.component.type === 'class') {
            const classDecl = this.component.componentRoot as ClassDeclaration
            classDecl.body.body.push(createPropertyDiffinition(DYNAMIC_THIS_FLAG, createLiteral(true)))
        } else if (this.component.type === 'defineComponent') {
            const body = this.component.componentRoot as ObjectExpression
            body.properties.push(createProperty(DYNAMIC_THIS_FLAG, createLiteral(true)))
        }
    }

    transform () {
        // nested class 组件不支持静态分析
        if (this.component.computed) {
            this.component.computed.properties.forEach(prop => {
                if (isSpreadElement(prop)) {
                    throw new Error('Spread element in computed is not supported.')
                } else if (isIdentifier(prop.key)) {
                    this.computedNames.add(prop.key.name)
                }
            })
            this.transformComputed(this.component.computed)
        }
        if (this.component.filters) {
            this.component.filters.properties.forEach(prop => {
                if (isSpreadElement(prop)) {
                    this.hasDymamicThis = true
                }
            })
            this.transformComputed(this.component.filters)
        }

        this.transformMethodCalls()
        debug('transformer:', {
            className: this.component.componentName || '',
            isDynamic: this.component.isDynamic,
            hasDymamicThis: this.hasDymamicThis,
            calledMethods: this.calledMethods,
            transformedCount: this.transformedCount
        })
        if (this.component.isDynamic || this.hasDymamicThis) {
            this.setDynamicThisFlag()
        }
        // 移除不需要的 hooks 和 静态成员
        this.cleanupDiscardedMembers()
    }

    minifyMethods () {
        // 仅在组件无动态 this 访问时移除未调用的方法
        if (!(this.component.isDynamic || this.hasDymamicThis)) {
            this.removeMethods()
        }
    }

    getTransformedCount () {
        return this.transformedCount
    }
}
