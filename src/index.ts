import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { SanComponent } from 'san'
import { ToJSCompileOptions } from './target-js/index'
import * as TypeGuards from './utils/type-guards'

// util functions
export { IDGenerator } from './utils/id-generator'
export { parseSanHTML, compareSanHTML, assertDeepEqual, assertSanHTMLEqual } from './utils/case'
export { autoCloseTags, booleanAttributes } from './utils/dom-util'
export { getANodePropByName } from './utils/anode-util'
export { Emitter } from './utils/emitter'
export { TypeGuards }
export { _ } from './runtime/underscore'

// class types
export { SanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile } from './models/san-source-file'
export { SanProject } from './models/san-project'
export { Compiler } from './models/compiler'
export { ComponentInfo, TypedComponentInfo, DynamicComponentInfo } from './models/component-info'
export { ComponentReference } from './models/component-reference'
export { COMPONENT_RESERVED_MEMBERS } from './models/component'
export { CompileInput } from './models/options'

let defaultProject: SanProject

export function compileToSource (ComponentClass: string | typeof SanComponent): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

export function compileToRenderer (ComponentClass: typeof SanComponent, options?: ToJSCompileOptions): Renderer {
    defaultProject = defaultProject || new SanProject()
    const renderer = defaultProject.compileToRenderer(ComponentClass, options)
    return renderer
}
