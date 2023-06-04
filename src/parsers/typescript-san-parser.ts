/**
 * TypeScript 文件解析器
 *
 * 从 TypeScript 文件源码，得到它里面的 San 信息，产出 TypedSanSourceFile。
 * TypedSanSourceFile 包含了若干个 TypedComponentInfo 和一个 entryComponentInfo。
 *
 * 使用 TypeScript 作为 SSR 的输入，通常用来 target 到其他语言，比如 PHP。
 * 因为 target 到其他语言时，需要类型信息才能更准确地把组件转换为代码。
 */
import type { SourceFile, ClassDeclaration, ObjectLiteralExpression } from 'ts-morph'
import { TypeGuards } from 'ts-morph'
import debugFactory from 'debug'
import {
    getChildComponents, getPropertyStringArrayValue, getComponentClassIdentifier, isChildClassOf, getPropertyStringValue
} from '../ast/ts-ast-util'
import { normalizeComponentClass } from './normalize-component'
import { TypedSanSourceFile } from '../models/san-source-file'
import { parseAndNormalizeTemplate } from './parse-template'
import { ComponentSSRType, TypedComponentInfo } from '../models/component-info'
import { componentID } from '../models/component-reference'
import type { strongParseSanSourceFileOptions } from '../compilers/renderer-options'

const debug = debugFactory('ts-component-parser')

/**
 * 把包含 San 组件定义的 TypeScript 源码，通过静态分析（AST），得到组件信息。
 */
export class TypeScriptSanParser {
    parse (sourceFile: SourceFile, options: strongParseSanSourceFileOptions) {
        const componentClassIdentifier = getComponentClassIdentifier(sourceFile, options.sanReferenceInfo)
        if (!componentClassIdentifier) {
            return new TypedSanSourceFile([], sourceFile)
        }
        const componentInfos: TypedComponentInfo[] = []

        // 初始声明的组件
        const classDeclarations = sourceFile.getClasses().filter(
            clazz => isChildClassOf(clazz, componentClassIdentifier)
        )
        const defaultClassDeclaration = classDeclarations.find(clazz => clazz.isDefaultExport())

        // ObjectLiteral 作为匿名组件
        // 在 parse 组件前难以解析，需要先遍历找出所有的 ObjectLiteral 并反向向上判断是否属于父级组件的 components
        // 所以在 parse components 时遇到再换转成 class 然后 push 到 classDeclarations 中参与遍历 parse
        let anonymousComponentId = 0
        const createClassFromObjectLiteral = (obj: ObjectLiteralExpression) => {
            const clazz = this.convertObjectLiteralToClassDeclaration(
                obj, 'SanSSRAnonymousComponent' + anonymousComponentId++
            )
            clazz.setExtends(componentClassIdentifier)
            classDeclarations.push(clazz)
            return clazz
        }

        // forEach 时再向数组中 push 元素不会被遍历到，所以改成 for of 循环
        for (const decl of classDeclarations) {
            const clazz = normalizeComponentClass(decl)
            const info = this.parseComponentClassDeclaration(
                clazz, defaultClassDeclaration, createClassFromObjectLiteral
            )
            componentInfos.push(info)
        }

        return new TypedSanSourceFile(
            componentInfos,
            sourceFile,
            componentInfos.find(info => info.classDeclaration.isDefaultExport())
        )
    }

    private parseComponentClassDeclaration (
        classDeclaration: ClassDeclaration,
        defaultClassDeclaration: ClassDeclaration | undefined,
        createClassFromObjectLiteral: (obj: ObjectLiteralExpression) => ClassDeclaration
    ): TypedComponentInfo {
        const template = getPropertyStringValue(classDeclaration, 'template', '')
        const trimWhitespace = getPropertyStringValue<'none' | 'blank' | 'all'>(classDeclaration, 'trimWhitespace')
        const ssrType = getPropertyStringValue<Exclude<ComponentSSRType, undefined>>(classDeclaration, 'ssr')
        const delimiters = getPropertyStringArrayValue<[string, string]>(classDeclaration, 'delimiters')
        const childComponents = getChildComponents(
            classDeclaration,
            defaultClassDeclaration,
            createClassFromObjectLiteral
        )

        for (const constructorDelcaration of classDeclaration.getConstructors()) {
            constructorDelcaration.remove()
        }

        return new TypedComponentInfo(
            componentID(classDeclaration.isDefaultExport(), classDeclaration.getName()!),
            parseAndNormalizeTemplate(template, {
                trimWhitespace, delimiters
            }),
            childComponents,
            ssrType,
            classDeclaration,

            // TypeScript 目前只支持 class 方式定义组件，还不支持 TemplateComponent
            'normal'
        )
    }

    private convertObjectLiteralToClassDeclaration (rawObjectExpr: ObjectLiteralExpression, className: string) {
        const sourceFile = rawObjectExpr.getSourceFile()
        const classDeclaration = sourceFile.addClass({
            name: className
        })
        for (const prop of rawObjectExpr.getProperties()) {
            if (!TypeGuards.isPropertyAssignment(prop)) throw new Error(`${JSON.stringify(prop.getText())} not supported`)
            const init = prop.getInitializer()
            const propDecl = classDeclaration.addProperty({
                isStatic: true,
                name: prop.getText()
            })
            propDecl.setInitializer(init!.getText())
        }
        return classDeclaration
    }
}
