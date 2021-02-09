import type { Node, MethodDeclaration, ShorthandPropertyAssignment, PropertyAssignment, ImportDeclaration, ClassDeclaration, SourceFile } from 'ts-morph'
import { TypeGuards, SyntaxKind } from 'ts-morph'
import debugFactory from 'debug'
import { TagName } from '../models/component-info'
import { componentID, ComponentReference } from '../models/component-reference'

const debug = debugFactory('ts-ast-util')

export function getSanImportDeclaration (sourceFile: SourceFile): ImportDeclaration | undefined {
    return sourceFile.getImportDeclaration(
        node => node.getModuleSpecifierValue() === 'san'
    )
}

export function getComponentClassIdentifier (sourceFile: SourceFile): string | undefined {
    const declaration = getSanImportDeclaration(sourceFile)
    if (!declaration) return

    const namedImports = declaration.getNamedImports()
    for (const namedImport of namedImports) {
        const name = namedImport.getName()
        if (name !== 'Component') continue

        const alias = namedImport.getAliasNode()
        if (alias) return alias.getText()
        return 'Component'
    }
}

export function isChildClassOf (clazz: ClassDeclaration, parentClass: string) {
    const extendClause = clazz.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword)
    if (!extendClause) return false

    const typeNode = extendClause.getTypeNodes().find(x => x.getText() === parentClass)
    if (!typeNode) return false

    return true
}

export function getComponentDeclarations (sourceFile: SourceFile) {
    const componentClassIdentifier = getComponentClassIdentifier(sourceFile)
    if (!componentClassIdentifier) return []
    return sourceFile.getClasses().filter(clazz => isChildClassOf(clazz, componentClassIdentifier))
}

export function getPropertyStringValue<T extends string> (clazz: ClassDeclaration, memberName: string, defaultValue: T): T;
export function getPropertyStringValue<T extends string> (clazz: ClassDeclaration, memberName: string): T | undefined;
export function getPropertyStringValue<T extends string> (clazz: ClassDeclaration, memberName: string, defaultValue?: T): T | undefined {
    const member = clazz.getProperty(memberName)
    if (!member) return defaultValue

    const init = member.getInitializer()
    if (!init) return defaultValue

    // 字符串常量，取其字面值
    const value = getLiteralText(init)
    if (value !== undefined) return value as T

    // 变量，找到定义处，取其字面值（非字面量跑错）
    if (TypeGuards.isIdentifier(init)) {
        const identName = init.getText()
        const file = clazz.getSourceFile()
        const decl = file.getVariableDeclarationOrThrow(identName)
        const value = decl.getInitializer()
        if (!value) throw new Error(`${JSON.stringify(decl.getParent().getText())} not supported, specify a string literal for "${memberName}"`)
        const str = getLiteralText(value)
        if (str === undefined) {
            throw new Error(`${JSON.stringify(value.getText())} not supported, specify a string literal for "${memberName}"`)
        }
        return str as T
    }
    throw new Error(`invalid "${memberName}" property`)
}

export function getPropertyStringArrayValue<T extends string[]> (clazz: ClassDeclaration, memberName: string): T | undefined {
    const member = clazz.getProperty(memberName)
    if (!member) return undefined

    const init = member.getInitializer()
    if (!init) return undefined

    if (!TypeGuards.isArrayLiteralExpression(init)) {
        throw new Error(`invalid "${memberName}": "${init.getText()}", array literal expected`)
    }
    return init.getElements().map(element => getLiteralText(element)) as T
}

function getLiteralText (expr: Node) {
    if (TypeGuards.isStringLiteral(expr) || TypeGuards.isNoSubstitutionTemplateLiteral(expr)) {
        return expr.getLiteralValue()
    }
}

export function getChildComponents (clazz: ClassDeclaration, defaultClassDeclaration?: ClassDeclaration): Map<TagName, ComponentReference> {
    const member = clazz.getProperty('components')
    const ret: Map<TagName, ComponentReference> = new Map()
    if (!member) return ret

    // 对引入的名称做索引，例如
    //
    // import XList from './list'
    // 索引为
    // 'XList' => { specifier: './list', named: false }
    const file = clazz.getSourceFile()
    const importedNames: Map<string, { specifier: string, named: boolean }> = new Map()
    for (const decl of file.getImportDeclarations()) {
        const specifier = decl.getModuleSpecifier().getLiteralValue()
        const defaultImport = decl.getDefaultImport()
        if (defaultImport) {
            importedNames.set(defaultImport.getText(), { specifier, named: false })
        }
        for (const namedImport of decl.getNamedImports()) {
            importedNames.set(namedImport.getName(), { specifier, named: true })
        }
    }

    // 子组件声明遍历，例如
    //
    // components: {
    //     'x-list': XList
    // }
    // 解析后的子组件信息为
    // 'x-list' => { specifier: './list', id: '0' }
    const init = member.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    for (const prop of init.getProperties()) {
        if (!TypeGuards.isPropertyAssignment(prop)) throw new Error(`${JSON.stringify(prop.getText())} not supported`)
        const propName = getPropertyAssignmentName(prop)
        // 判断是否为 'self' 使用自己作为组件
        // 用法见 https://baidu.github.io/san/tutorial/component/#components
        const propStringValue = prop.getInitializerIfKind(SyntaxKind.StringLiteral)
        if (propStringValue) {
            if (propStringValue.getLiteralValue() !== 'self') {
                throw new Error(`Invalid component for ${propName}`)
            }
            ret.set(propName, new ComponentReference(
                '.',
                componentID(clazz.isDefaultExport(), clazz.getName()!)
            ))
            continue
        }
        const childComponentClassName = prop.getInitializerIfKindOrThrow(SyntaxKind.Identifier).getText()
        if (importedNames.has(childComponentClassName)) { // 子组件来自外部源文件
            const { specifier, named } = importedNames.get(childComponentClassName)!
            ret.set(propName, new ComponentReference(
                specifier,
                componentID(!named, childComponentClassName)
            ))
        } else { // 子组件来自当前源文件
            const isDefault = !!defaultClassDeclaration && defaultClassDeclaration.getName() === childComponentClassName
            ret.set(propName, new ComponentReference(
                '.',
                componentID(isDefault, childComponentClassName)
            ))
        }
    }
    return ret
}

export function getObjectLiteralPropertyKeys (clazz: ClassDeclaration, propertyName: string): string[] {
    const prop = clazz.getProperty(propertyName)
    if (!prop) return []

    const init = prop.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    return init.getProperties().map(prop => {
        if (TypeGuards.isPropertyAssignment(prop)) return getPropertyAssignmentName(prop)
        if (TypeGuards.isShorthandPropertyAssignment(prop)) return getPropertyAssignmentName(prop)
        if (TypeGuards.isMethodDeclaration(prop)) return getPropertyAssignmentName(prop)
        throw new Error('object property not recognized')
    })
}

export function getPropertyAssignmentName (prop: PropertyAssignment | ShorthandPropertyAssignment | MethodDeclaration) {
    const nameNode = prop.getNameNode()
    return TypeGuards.isStringLiteral(nameNode) ? nameNode.getLiteralValue() : prop.getName()
}
