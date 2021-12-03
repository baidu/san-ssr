/**
 * 项目入口文件
 *
 * 负责 import/export 其他文件，以及简单的包装
 */

import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { CompileOptions } from './target-js/compilers/compile-options'
import * as TypeGuards from './ast/san-ast-type-guards'
import { Component } from 'san'

// util functions
export { IDGenerator } from './utils/id-generator'
export { parseSanHTML, compareSanHTML, assertDeepEqual, assertSanHTMLEqual } from './utils/case'
export { autoCloseTags, booleanAttributes } from './utils/dom-util'
export { getANodePropByName } from './ast/san-ast-util'
export { Emitter } from './utils/emitter'
export { TypeGuards }
export { _ } from './runtime/underscore'
export { SyntaxKind } from './ast/renderer-ast-dfn'
export type { Expression, Statement, FunctionDefinition, VariableDefinition, Literal, MapLiteral, ArrayLiteral, UnaryExpression, Foreach, BinaryExpression, SlotRendererDefinition, SlotRenderCall } from './ast/renderer-ast-dfn'
export { assertNever } from './utils/lang'
export { markExternalComponent, cancelMarkExternalComponent } from './helpers/markExternalComponent'

// class types
export { SanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile } from './models/san-source-file'
export { SanProject } from './models/san-project'
export { TargetCodeGenerator, TargetCodeGenerator as Compiler } from './models/target-code-generator'
export { ComponentInfo, TypedComponentInfo, DynamicComponentInfo } from './models/component-info'
export { ComponentReference } from './models/component-reference'
export { COMPONENT_RESERVED_MEMBERS } from './models/component'
export { CompileInput } from './models/options'
export { RenderOptions } from './compilers/renderer-options'

let defaultProject: SanProject

export function compileToSource (ComponentClass: string | Component): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

export function compileToRenderer (ComponentClass: Component, options?: CompileOptions): Renderer {
    defaultProject = defaultProject || new SanProject()
    const renderer = defaultProject.compileToRenderer(ComponentClass, options)
    return renderer
}
