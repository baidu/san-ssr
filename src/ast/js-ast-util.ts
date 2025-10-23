/**
 * JavaScript 语法树的工具
 *
 * AST Spec: ESTree Spec: https://github.com/estree/estree
 * Implementation: acorn
 *
 * 方便读取和操作 ESTree 结构，本文件里提供的功能和实现逻辑是和具体 SSR 逻辑无关的，只和 ESTree 有关。
 */

import { ancestor, simple } from 'acorn-walk'
import assert, { strictEqual } from 'assert'
import {
    Node,
    MethodDefinition,
    ExportDefaultDeclaration,
    ImportDeclaration,
    Property,
    BinaryExpression,
    ClassExpression,
    ClassDeclaration,
    ThisExpression,
    ExpressionStatement,
    TemplateLiteral,
    Literal,
    Identifier,
    MemberExpression,
    ArrayExpression,
    CallExpression,
    ObjectExpression,
    Program,
    Pattern,
    VariableDeclaration,
    ObjectPattern,
    Class,
    AssignmentExpression,
    Expression,
    ImportSpecifier,
    ImportDefaultSpecifier,
    VariableDeclarator,
    ExportNamedDeclaration
} from 'acorn'

const OPERATORS = {
    '+': (l: any, r: any) => l + r
}

// 按照 node 的 type 来过滤数组
export function filterByType (node: Node, type: 'VariableDeclaration'): VariableDeclaration[]
export function filterByType (node: Node, type: 'ImportDeclaration'): ImportDeclaration[]
export function filterByType (node: Node, type: 'MemberExpression'): MemberExpression[]
export function filterByType (node: Node, type: string) {
    const results: any[] = []
    simple(node, {
        [type]: (node: Node) => results.push(node)
    })
    return results
}

// 获取 require 的模块名。
// 例如：对于 node = <require('san')>，getRequireSpecifier(node) === 'san'
export function getRequireSpecifier (node: CallExpression): string {
    const arg = node['arguments'][0]
    assertLiteral(arg)
    return arg.value as string
}

// 是否是 require 了 spec 的语句。
// 例如：对于 node = <require('san')>，isRequireSpecifier(node, 'san') === true
export function isRequireSpecifier (node: Expression, spec: string[]) {
    return isRequire(node) && spec.includes(getRequireSpecifier(node))
}

export function isModuleExports (node: Node) {
    // exports = Foo
    if (isIdentifier(node) && node['name'] === 'exports') return true
    // module.exports = Foo
    if (isMemberExpression(node) && (node.object as Identifier)['name'] === 'module' && (node.property as Identifier)['name'] === 'exports') return true
    return false
}

// expr 是否形如：exports.xxx
export function isExportsMemberExpression (expr: Pattern) {
    return isMemberExpression(expr) &&
        getStringValue(expr['object'] as Expression) === 'exports'
}

/**
 * 找到 node 下面所有的 require 语句
 *
 * 通过迭代器返回每一个 require 的 localName、moduleName、exportName。
 * 例如：let foo = require('bar').coo，会 yield ["foo", "bar", "coo"]
 */
export function * findScriptRequires (node: Node): Generator<[string, string, string, VariableDeclaration]> {
    for (const decl of filterByType(node, 'VariableDeclaration')) {
        const { id, init } = decl.declarations[0]
        if (!init) continue
        if (isRequire(init)) {
            const specifier = getRequireSpecifier(init)
            if (isIdentifier(id)) yield [id.name, specifier, 'default', decl]
            if (isObjectPattern(id)) {
                for (const [key, value] of getPropertiesFromObject(id)) {
                    assertIdentifier(value)
                    yield [value.name, specifier, key, decl]
                }
            }
        }
        // const C = require('san').Component
        if (isMemberExpression(init) && isRequire(init.object)) {
            const specifier = getRequireSpecifier(init.object)
            assertIdentifier(id)
            yield [id.name, specifier, getStringValue(init.property as Expression), decl]
        }
    }
}

/**
 * 找到 root 下所有的 import 语句
 *
 * 通过迭代器返回每一个 require 的 localName、moduleName、exportName。
 * 例如：import { coo as foo } from 'bar'，会 yield ["foo", "bar", "coo"]
 */
export function * findESMImports (root: Node): Generator<[string, string, string, ImportDeclaration]> {
    for (const node of filterByType(root, 'ImportDeclaration')) {
        const relativeFile = node.source.value as string
        for (const spec of node['specifiers']) {
            if (isImportDefaultSpecifier(spec)) {
                yield [spec.local.name, relativeFile, 'default', node]
            }
            if (isImportSpecifier(spec)) {
                yield [
                    spec.local.name,
                    relativeFile,
                    spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value as string,
                    node
                ]
            }
        }
    }
}

/**
 * 找到每个 localName 对应的 exportName。
 */
export function findExportNames (root: Program) {
    const names: [string, string][] = []
    simple(root, {
        ExportDefaultDeclaration (node) {
            const decl = (node as unknown as ExportDefaultDeclaration)['declaration']
            // export default Foo
            if (isIdentifier(decl)) names.push([decl.name, 'default'])
        },
        ExportNamedDeclaration (node) {
            if (isVariableDeclaration((node as unknown as ExportNamedDeclaration)['declaration']!)) {
                // export const foo = Foo, bar = Bar
                for (const decl of ((node as unknown as ExportNamedDeclaration)['declaration'] as VariableDeclaration).declarations) {
                    assertVariableDeclarator(decl)
                    assertIdentifier(decl.id)
                    assertIdentifier(decl.init!)
                    names.push([decl.init.name, decl.id.name])
                }
            }
        },
        AssignmentExpression: (node) => {
            const { left, right } = node as any
            // module.exports.foo = bar
            if (isIdentifier(right) && isMemberExpression(left) && isModuleExports(left.object)) {
                names.push([right.name, getStringValue(left.property as Expression)])
            }
            if (isModuleExports(left)) {
                // module.exports = Foo
                if (isIdentifier(right)) {
                    names.push([right.name, 'default'])
                }
                // module.exports = {foo: bar}
                if (isObjectExpression(right)) {
                    for (const [exported, value] of getPropertiesFromObject(right)) {
                        assertIdentifier(value)
                        names.push([value.name, exported])
                    }
                }
            }
        }
    })
    return names
}

/**
 * 获得字符串数组节点的值
 */
export function getStringArrayValue (expr: Node) {
    assertArrayExpression(expr)
    return expr.elements.map(getLiteralValue)
}

/**
 * 从 Class 节点，获得它的所有属性的 key（字符串）和 value（AST 节点）
 */
export function * getMembersFromClassDeclaration (expr: Class): Generator<[string, Node]> {
    for (const decl of expr.body.body) {
        if ((decl as MethodDefinition)['kind'] === 'constructor') {
            const constructorDecl = decl as MethodDefinition
            for (const expr of constructorDecl.value.body.body) {
                if (isExpressionStatement(expr) &&
                    isAssignmentExpression(expr.expression) &&
                    isMemberAssignment(expr.expression.left)
                ) yield [getStringValue((expr.expression.left as MemberExpression)['property'] as Expression), expr.expression.right]
            }
        } else if (decl.type === 'MethodDefinition') {
            yield [getStringValue(decl.key as Expression), decl.value]
        } else if (decl.type === 'PropertyDefinition') {
            yield [getStringValue(decl.key as Expression), decl.value as Node]
        } else if (decl.type === 'StaticBlock') {
            throw new Error('Static blocks are not supported')
        }
    }
}

export function getConstructor (expr: Class): undefined | MethodDefinition {
    for (const method of expr.body.body) {
        if ((method as MethodDefinition).kind === 'constructor') return method as MethodDefinition
    }
}

/**
 * 给字面量的对象，添加一个字符串类型的属性
 */
export function addStringPropertyForObject (expr: ObjectExpression, key: string, value: string) {
    expr.properties.push({
        type: 'Property',
        method: false,
        shorthand: false,
        computed: false,
        key: { type: 'Identifier', name: key, start: 0, end: 0 },
        value: { type: 'Literal', value: value, raw: JSON.stringify(value), start: 0, end: 0 },
        kind: 'init',
        start: 0,
        end: 0
    })
}

export function getPropertyFromObject (obj: ObjectExpression | ObjectPattern, propertyName: string): Node | undefined {
    for (const [key, val] of getPropertiesFromObject(obj)) {
        if (key === propertyName) return val
    }
}

export function * getPropertiesFromObject (obj: ObjectExpression | ObjectPattern): Generator<[string, Node]> {
    for (const prop of obj.properties) {
        assertProperty(prop)
        yield [getStringValue(prop.key), prop.value]
    }
}

function isMemberAssignment (expr: Pattern): boolean {
    return isMemberExpression(expr) && isThisExpression(expr.object)
}

export function isClass (node: Node): node is Class {
    return isClassExpression(node) || isClassDeclaration(node)
}

export function getClassName (node: Node) {
    if (isClass(node) && node.id) return node.id.name
    return ''
}

export function getStringValue (node: Expression): any {
    if (isIdentifier(node)) return node['name']
    if (isLiteral(node)) return node['value']
    throw new Error(`${location(node)} cannot evaluate string value`)
}

/**
 * 获取一个字面量表达式节点的值
 */
export function getLiteralValue (node: Node | null): any {
    if (node == null) return undefined
    if (isBinaryExpression(node)) {
        const left = getLiteralValue(node.left)
        const right = getLiteralValue(node.right)
        const op = OPERATORS[node.operator as '+']
        assert(op, `operator "${node.operator}" not supported'`)
        return op(left, right)
    }
    if (isLiteral(node)) return node.value
    if (isTemplateLiteral(node)) {
        strictEqual(node.expressions.length, 0, 'template expressions are not supported')
        return node.quasis.map(quasis => quasis.value.cooked).join('')
    }
    throw new Error(`${location(node)} expected literal`)
}

/**
 * 获取整个程序里，对 objName 的属性的所有赋值
 */
export function getMemberAssignmentsTo (program: Program, objName: string) {
    const results: [string, Node][] = []
    simple(program, {
        AssignmentExpression (node: Node) {
            const expr = node as any as AssignmentExpression
            if (isMemberExpression(expr.left) && isIdentifier(expr.left.object) && expr.left.object.name === objName) {
                results.push([getStringValue(expr.left.property as Expression), expr.right])
            }
        }
    })
    return results
}

export function location (node: Node) {
    return `[${(node as Node)['start']},${(node as Node)['end']})`
}

/**
 * 获取一个源码文件的默认导出，有两种形式：
 * 1. module.exports = foo
 * 2. export foo
 */
export function findDefaultExport (node: Program): undefined | Node {
    let result
    simple(node, {
        ExportDefaultDeclaration (node) {
            result = (node as any as ExportDefaultDeclaration).declaration
        },
        AssignmentExpression (node) {
            const expr = node as any as AssignmentExpression
            if (isModuleExports(expr.left)) result = expr.right
        }
    })
    return result
}

export function isProgram (node: Node): node is Program {
    return node.type === 'Program'
}

export function isRequire (node: Node): node is CallExpression {
    return isCallExpression(node) && (node.callee as Identifier)['name'] === 'require'
}

export function isMemberExpression (expr: Node): expr is MemberExpression {
    return expr.type === 'MemberExpression'
}

export function isBinaryExpression (expr: Node): expr is BinaryExpression {
    return expr.type === 'BinaryExpression'
}

export function isIdentifier (expr: Node): expr is Identifier {
    return expr.type === 'Identifier'
}

export function isTemplateLiteral (expr: Node): expr is TemplateLiteral {
    return expr.type === 'TemplateLiteral'
}

export function isLiteral (expr: Node): expr is Literal {
    return expr.type === 'Literal'
}

export function isVariableDeclaration (expr: Node): expr is VariableDeclaration {
    return expr.type === 'VariableDeclaration'
}

export function isVariableDeclarator (expr: Node): expr is VariableDeclarator {
    return expr.type === 'VariableDeclarator'
}

export function isCallExpression (expr: Node): expr is CallExpression {
    return expr.type === 'CallExpression'
}

export function isObjectPattern (expr: Node): expr is ObjectPattern {
    return expr.type === 'ObjectPattern'
}

export function isObjectExpression (expr: Node): expr is ObjectExpression {
    return expr.type === 'ObjectExpression'
}

export function isImportDefaultSpecifier (expr: Node): expr is ImportDefaultSpecifier {
    return expr.type === 'ImportDefaultSpecifier'
}

export function isImportSpecifier (expr: Node): expr is ImportSpecifier {
    return expr.type === 'ImportSpecifier'
}

export function isExpressionStatement (expr: Node): expr is ExpressionStatement {
    return expr.type === 'ExpressionStatement'
}

export function isAssignmentExpression (expr: Node): expr is AssignmentExpression {
    return expr.type === 'AssignmentExpression'
}

export function isThisExpression (expr: Node): expr is ThisExpression {
    return expr.type === 'ThisExpression'
}

export function isClassDeclaration (expr: Node): expr is ClassDeclaration {
    return expr.type === 'ClassDeclaration'
}

export function isClassExpression (expr: Node): expr is ClassExpression {
    return expr.type === 'ClassExpression'
}

export function isProperty (expr: Node): expr is Property {
    return expr.type === 'Property'
}

export function isExportDefaultDeclaration (node: Node): node is ExportDefaultDeclaration {
    return node.type === 'ExportDefaultDeclaration'
}

export function isArrayExpression (expr: Node): expr is ArrayExpression {
    return expr.type === 'ArrayExpression'
}

export function assertProperty (expr: Node): asserts expr is Property {
    assert(isProperty(expr))
}

export function assertLiteral (expr: Node): asserts expr is Literal {
    assert(isLiteral(expr))
}

export function assertIdentifier (expr: Node): asserts expr is Identifier {
    assert(isIdentifier(expr))
}

export function assertArrayExpression (expr: Node): asserts expr is ArrayExpression {
    assert(isArrayExpression(expr))
}

export function assertObjectExpression (expr: Node): asserts expr is ObjectExpression {
    assert(isObjectExpression(expr))
}

export function assertVariableDeclarator (expr: Node): asserts expr is VariableDeclarator {
    assert(isVariableDeclarator(expr))
}

export function deleteMembersFromClassDeclaration (expr: Class, name: string) {
    for (const [, decl] of expr.body.body.entries()) {
        if ((decl as MethodDefinition)['kind'] === 'constructor') {
            const constructorDecl = decl as MethodDefinition
            for (const [index, node] of constructorDecl.value.body.body.entries()) {
                if (isExpressionStatement(node) &&
                    isAssignmentExpression(node.expression) &&
                    isMemberAssignment(node.expression.left) &&
                    getStringValue((node.expression.left as MemberExpression)['property'] as Expression) === name
                ) {
                    constructorDecl.value.body.body.splice(index, 1)
                }
            }
            continue
        }
    }
}
export function deletePropertiesFromObject (obj: ObjectExpression | ObjectPattern, name: string) {
    for (const [index, prop] of obj.properties.entries()) {
        assertProperty(prop)
        if (getStringValue(prop.key) === name) {
            obj.properties.splice(index, 1)
        }
    }
}
export function deleteMemberAssignmentsTo (program: Program, objName: string, name: string) {
    ancestor(program, {
        AssignmentExpression (node: Node, ancestors: Node[]) {
            const expr = node as any as AssignmentExpression
            if (
                isMemberExpression(expr.left) &&
                isIdentifier(expr.left.object) &&
                expr.left.object.name === objName &&
                isIdentifier(expr.left.property) &&
                expr.left.property.name === name
            ) {
                const res = findValidParent(ancestors as Node[])
                if (res && res.parent) {
                    res.parent.body.splice(res.index, 1)
                }
            }
        }
    })

    function findValidParent (ancestors: Node[]) {
        for (let i = ancestors.length - 1; i > -1; i--) {
            const node = ancestors[i]
            if (isProgram(node)) {
                return {
                    parent: node,
                    index: node.body.indexOf(ancestors[i + 1] as ExpressionStatement)
                }
            }
        }
    }
}
