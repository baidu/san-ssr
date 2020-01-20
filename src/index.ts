import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { SanComponent } from 'san'
import { ToJSCompileOptions } from './target-js/index'

// util functions
export { parseSanHTML, assertSanHTMLEqual } from './utils/case'
export { getInlineDeclarations } from './parsers/dependency-resolver'
export { autoCloseTags, booleanAttributes } from './utils/dom-util'
export { getANodeProps, getANodePropByName } from './utils/anode-util'
export { Emitter } from './utils/emitter'
export { execCommandSync } from './loaders/exec'

// class types
export { SanSourceFile } from './models/san-sourcefile'
export { SanApp } from './models/san-app'
export { SanProject } from './models/san-project'
export { Compiler } from './models/compiler'
export { SanSSRFiltersDeclarations, SanSSRComputedDeclarations, isComponentLoader, COMPONENT_RESERVED_MEMBERS } from './models/component'

/**
 * Legacy API: compile a ComponentClass to a renderer function body
 */
export function compileToSource (ComponentClass: typeof SanComponent): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

/**
 * Legacy API: compile a ComponentClass to a function string and eval that function
 */
export function compileToRenderer (ComponentClass: typeof SanComponent, options?: ToJSCompileOptions): Renderer {
    const proj = new SanProject({ tsConfigFilePath: null })
    const renderer = proj.compileToRenderer(ComponentClass, options)
    return renderer
}
