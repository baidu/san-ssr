import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { SanComponent } from 'san'
import { ToJSCompileOptions } from './target-js/index'
import * as TypeGuards from './utils/type-guards'

// util functions
export { parseSanHTML, compareSanHTML, assertSanHTMLEqual } from './utils/case'
export { getInlineDeclarations } from './parsers/dependency-resolver'
export { autoCloseTags, booleanAttributes } from './utils/dom-util'
export { getANodeProps, getANodePropByName } from './utils/anode-util'
export { Emitter } from './utils/emitter'
export { TypeGuards }

// class types
export { SanSourceFile } from './models/san-sourcefile'
export { SanApp } from './models/san-app'
export { SanProject } from './models/san-project'
export { Compiler } from './models/compiler'
export { ComponentInfo } from './models/component-info'
export { ComponentTree } from './models/component-tree'
export { isComponentLoader, COMPONENT_RESERVED_MEMBERS } from './models/component'
export { CompiledComponent } from './models/compiled-component'

let defaultProject: SanProject

export function compileToSource (ComponentClass: string | typeof SanComponent): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

export function compileToRenderer (ComponentClass: string | typeof SanComponent, options?: ToJSCompileOptions): Renderer {
    defaultProject = defaultProject || new SanProject()
    const renderer = defaultProject.compileToRenderer(ComponentClass, options)
    return renderer
}
