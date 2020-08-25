import type { SourceFile, ClassDeclaration } from 'ts-morph'
import debugFactory from 'debug'
import { getChildComponents, getPropertyStringArrayValue, getComponentDeclarations, getPropertyStringValue } from '../utils/ast-util'
import { normalizeComponentClass } from './normalize-component'
import { TypedSanSourceFile } from '../models/san-source-file'
import { parseAndNormalizeTemplate } from './parse-template'
import { TypedComponentInfo } from '../models/component-info'
import { getExportedComponentID, getDefaultExportedComponentID } from '../models/component-reference'

const debug = debugFactory('ts-component-parser')

/**
 * 把包含 San 组件定义的 TypeScript 源码，通过静态分析（AST），得到组件信息。
 */
export class TypeScriptSanParser {
    parse (sourceFile: SourceFile) {
        const classDeclarations = getComponentDeclarations(sourceFile).map(normalizeComponentClass)
        const defaultClassDeclaration = classDeclarations.find(clazz => clazz.isDefaultExport())
        const componentInfos: TypedComponentInfo[] = classDeclarations.map(decl => this.parseComponentClassDeclaration(decl, defaultClassDeclaration))
        return new TypedSanSourceFile(componentInfos, sourceFile, componentInfos.find(info => info.classDeclaration.isDefaultExport()))
    }

    private parseComponentClassDeclaration (classDeclaration: ClassDeclaration, defaultClassDeclaration?: ClassDeclaration): TypedComponentInfo {
        const template = getPropertyStringValue(classDeclaration, 'template', '')
        const trimWhitespace = getPropertyStringValue<'none' | 'blank' | 'all'>(classDeclaration, 'trimWhitespace')
        const delimiters = getPropertyStringArrayValue<[string, string]>(classDeclaration, 'delimiters')
        const childComponents = getChildComponents(classDeclaration, defaultClassDeclaration)

        for (const constructorDelcaration of classDeclaration.getConstructors()) {
            constructorDelcaration.remove()
        }

        return new TypedComponentInfo(
            classDeclaration.isDefaultExport() ? getDefaultExportedComponentID() : getExportedComponentID(classDeclaration.getName()!),
            template,
            parseAndNormalizeTemplate(template, {
                trimWhitespace, delimiters
            }),
            childComponents,
            classDeclaration
        )
    }
}
