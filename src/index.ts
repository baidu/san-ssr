import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { ComponentConstructor } from 'san'
import { CompileOptions } from './target-js/compilers/compile-options'
import * as TypeGuards from './ast/san-type-guards'

// util functions
export { IDGenerator } from './utils/id-generator'
export { parseSanHTML, compareSanHTML, assertDeepEqual, assertSanHTMLEqual } from './utils/case'
export { autoCloseTags, booleanAttributes } from './utils/dom-util'
export { getANodePropByName } from './ast/san-ast-util'
export { Emitter } from './utils/emitter'
export { TypeGuards }
export { _ } from './runtime/underscore'
export { SyntaxKind } from './ast/renderer-ast-node'
export type { Expression, Statement, FunctionDefinition, VariableDefinition, Literal, MapLiteral, ArrayLiteral, UnaryExpression, Foreach, BinaryExpression, SlotRendererDefinition, SlotRenderCall } from './ast/renderer-ast-node'
export { assertNever } from './utils/lang'

// class types
export { SanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile } from './models/san-source-file'
export { SanProject } from './models/san-project'
export { Compiler } from './models/compiler'
export { ComponentInfo, TypedComponentInfo, DynamicComponentInfo } from './models/component-info'
export { ComponentReference } from './models/component-reference'
export { COMPONENT_RESERVED_MEMBERS } from './models/component'
export { CompileInput } from './models/options'
export { RenderOptions } from './compilers/renderer-options'

let defaultProject: SanProject

export function compileToSource (ComponentClass: string | ComponentConstructor<any, any>): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

export function compileToRenderer (ComponentClass: ComponentConstructor<any, any>, options?: CompileOptions): Renderer {
    defaultProject = defaultProject || new SanProject()
    const renderer = defaultProject.compileToRenderer(ComponentClass, options)
    return renderer
}
