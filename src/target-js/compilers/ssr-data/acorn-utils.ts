import {
    AssignmentExpression, CallExpression, MemberExpression, Node, Identifier, SpreadElement,
    Literal, Expression, ObjectExpression, FunctionExpression, TemplateLiteral,
    TemplateElement, ExpressionStatement, MethodDefinition, PropertyDefinition,
    ThisExpression, Property, VariableDeclarator, BlockStatement, Program
} from 'acorn'
import walk from 'acorn-walk'

export function isMemberExpression (node: Node): node is MemberExpression {
    return node?.type === 'MemberExpression'
}

export function isIdentifier (node: Node): node is Identifier {
    return node?.type === 'Identifier'
}

export function isProperty (node: Node): node is Property {
    return node?.type === 'Property'
}

export function isThisExpression (node: Node): node is ThisExpression {
    return node?.type === 'ThisExpression'
}

export function isLiteral (node: Node): node is Literal {
    return node?.type === 'Literal'
}

export function isCallExpression (node: Node): node is CallExpression {
    return node?.type === 'CallExpression'
}

export function isAssignmentExpression (node: Node): node is AssignmentExpression {
    return node?.type === 'AssignmentExpression'
}

export function isExpressionStatement (node: Node): node is ExpressionStatement {
    return node?.type === 'ExpressionStatement'
}

export function isObjectExpression (node: Node): node is ObjectExpression {
    return node?.type === 'ObjectExpression'
}

export function isFunctionExpression (node: Node): node is FunctionExpression {
    return node?.type === 'FunctionExpression'
}

export function isSpreadElement (node: Node): node is SpreadElement {
    return node?.type === 'SpreadElement'
}

export function isMethodDefinition (node: Node): node is MethodDefinition {
    return node?.type === 'MethodDefinition'
}

export function isPropertyDefinition (node: Node): node is PropertyDefinition {
    return node?.type === 'PropertyDefinition'
}

export function isVariableDeclarator (node: Node): node is VariableDeclarator {
    return node?.type === 'VariableDeclarator'
}

export function isBlockStatement (node: Node): node is BlockStatement {
    return node?.type === 'BlockStatement'
}

export function isProgram (node: Node): node is Program {
    return node?.type === 'Program'
}

/**
 * 判断节点是否为无表达式的模板字符串
 * @param node
 * @returns
 */
export function isTemplateLiteralString (node: Node): boolean {
    return node?.type === 'TemplateLiteral' && (node as TemplateLiteral).expressions.length === 0
}

/**
 * 用 newNode 替换 oldNode 的内容, 用于修改 AST 节点
 * @param oldNode
 * @param newNode
 */
export function replaceNode (oldNode: Node, newNode: Node): void {
    for (const key in Object.keys(oldNode)) {
        delete (oldNode as any)[key]
    }
    Object.assign(oldNode as any, newNode)
}

/**
 * 查找最近的调用表达式节点
 * @param ancestors
 * @returns
 */
function findNearestCall (ancestors: Node[]): CallExpression | undefined {
    for (let i = ancestors.length - 2; i >= 0; i--) {
        const node = ancestors[i]
        if (isCallExpression(node)) {
            return node
        }
    }
    return undefined
}

/**
 * 查找函数体内的 this.methodName() 调用，并检测是否有动态 this 使用
 * @param root
 * @returns
 */
export function findThisMethodCalls (root: FunctionExpression): {methodNames: Set<string>, hasDymamicThis: boolean} {
    const methodNames = new Set<string>()
    let hasDymamicThis = false
    walk.ancestor(root, {
        // detect this.methodName()
        CallExpression: (node: CallExpression) => {
            if (isMemberExpression(node.callee)) {
                if (isThisExpression(node.callee.object)) {
                    if (isIdentifier(node.callee.property)) {
                        methodNames.add(node.callee.property.name)
                    } else {
                        hasDymamicThis = true
                    }
                } else if (isMemberExpression(node.callee.object) &&
                    isIdentifier(node.callee.property) &&
                    ['call', 'apply', 'bind'].includes(node.callee.property.name) &&
                    isThisExpression(node.callee.object.object)) {
                    // detect this.method.call()
                    if (!node.callee.object.computed && isIdentifier(node.callee.object.property)) {
                        methodNames.add(node.callee.object.property.name)
                    } else {
                        // this[methodName].call()
                        hasDymamicThis = true
                    }
                }
            }
        },
        // detect dynamic this usage, var a = this, call(this), etc.
        ThisExpression: (node: ThisExpression, ancestors: Node[]) => {
            const parent = ancestors[ancestors.length - 2]
            if (!(isMemberExpression(parent) && parent.object === node)) {
                const callExpr = findNearestCall(ancestors)
                // this.methodName([this]) calls
                if (callExpr && isMemberExpression(callExpr.callee) && isThisMethodCall(callExpr.callee)) {
                    // do nothing
                } else {
                    hasDymamicThis = true
                }
            }
            // function a() { this.methodName() }
            if (ancestors.some(n => isFunctionExpression(n) && n !== root)) {
                hasDymamicThis = true
            }
        }
    })
    return {
        methodNames,
        hasDymamicThis
    }
}

/**
 * 创建模板字符串元素节点
 * @param raw 原始字符串
 * @param cooked 转义后的字符串
 * @returns
 */
export function createTemplateElement (raw: string, cooked = raw): TemplateElement {
    return {
        type: 'TemplateElement',
        value: {
            raw,
            cooked
        },
        tail: false,
        start: 0,
        end: 0
    } as TemplateElement
}

/**
 * 创建 this.data.get/set(...args) 调用节点
 * @param fnName
 * @param args
 * @returns
 */
export function createThisDataNode (fnName: string, args: Expression[]): CallExpression {
    return {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                object: { type: 'ThisExpression', start: 0, end: 0 },
                property: { type: 'Identifier', name: 'data', start: 0, end: 0 },
                computed: false,
                start: 0,
                end: 0
            },
            property: { type: 'Identifier', name: fnName, start: 0, end: 0 },
            computed: false,
            optional: false,
            start: 0,
            end: 0
        },
        arguments: args
    } as CallExpression
}

/**
 * 创建 this.data.raw 节点
 * @returns
 */
export function createThisDataRawNode (): MemberExpression {
    return {
        type: 'MemberExpression',
        object: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression', start: 0, end: 0 },
            property: { type: 'Identifier', name: 'data', start: 0, end: 0 },
            computed: false,
            start: 0,
            end: 0
        },
        property: { type: 'Identifier', name: 'raw', start: 0, end: 0 },
        computed: false,
        optional: false,
        start: 0,
        end: 0
    } as MemberExpression
}

/**
 * 创建一条属性访问链, 如 a?.b?.c?.d
 * @param object root object
 * @param paths
 * @returns
 */
export function createPropertyChain (object: MemberExpression | ThisExpression, paths: string[]): MemberExpression {
    let currentNode = object
    for (let i = 0; i < paths.length; i++) {
        currentNode = {
            type: 'MemberExpression',
            object: currentNode,
            property: {
                type: 'Identifier',
                name: paths[i],
                start: 0,
                end: 0
            },
            computed: false,
            optional: i !== 0,
            start: 0,
            end: 0
        }
    }
    return currentNode as MemberExpression
}

/**
 * 创建字面量节点
 * @param value
 * @returns
 */
export function createLiteral (value: string | boolean | number | null): Literal {
    return {
        type: 'Literal',
        value,
        raw: JSON.stringify(value),
        start: 0,
        end: 0
    } as Literal
}

/**
 * 创建字面量属性定义节点
 * @param key
 * @param value
 * @returns
 */
export function createPropertyDiffinition (key: string, value: Expression): PropertyDefinition {
    return {
        type: 'PropertyDefinition',
        key: {
            type: 'Identifier',
            name: key,
            start: 0,
            end: 0
        } as Identifier,
        value: value,
        static: false,
        start: 0,
        end: 0
    } as PropertyDefinition
}

/**
 * 创建对象属性节点
 * @param key
 * @param value
 * @returns
 */
export function createProperty (key: string, value: Expression): Property {
    return {
        type: 'Property',
        key: {
            type: 'Identifier',
            name: key,
            start: 0,
            end: 0
        } as Identifier,
        value: value,
        kind: 'init',
        method: false,
        shorthand: false,
        start: 0,
        end: 0
    } as Property
}

/**
 * 创建赋值表达式节点
 * @param left
 * @param right
 * @returns
 */
export function createAssignment (left: Expression, right: Expression): AssignmentExpression {
    return {
        type: 'AssignmentExpression',
        operator: '=',
        left: left,
        right: right,
        start: 0,
        end: 0
    } as AssignmentExpression
}

/**
 * 判断 memberExpr 是否为 this.methodName(...) 调用
 * @param memberExpr
 * @param methodNames
 * @returns
 */
export function isThisMethodCall (memberExpr: MemberExpression): boolean {
    while (isMemberExpression(memberExpr.object)) {
        memberExpr = memberExpr.object
    }
    if (isThisExpression(memberExpr.object) && isIdentifier(memberExpr.property)) {
        return true
    }
    return false
}

/**
 * 获取 defineComponent 组件的名称
 * @param parent
 * @returns
 */
export function getDefinedComponentName (parent: Node): string | undefined {
    if (isVariableDeclarator(parent) && isIdentifier(parent.id)) {
        return parent.id.name
    } else if (isAssignmentExpression(parent) && isIdentifier(parent.left)) {
        return parent.left.name
    }
    return undefined
}

/**
 * 将 defineComponent 节点替换为 {}
 * @param nodes
 * @returns
 */
export function removeDefineComponent (nodes: CallExpression[]): number {
    for (const node of nodes) {
        replaceNode(node, {
            type: 'ObjectExpression',
            properties: [],
            start: 0,
            end: 0
        } as ObjectExpression)
    }
    return nodes.length
}
