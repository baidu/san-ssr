import { SanProject } from './models/san-project'
import { Renderer } from './models/renderer'
import { Component } from 'san'

// util functions
export { parseSanHTML, assertSanHTMLEqual } from './utils/case'
export { getInlineDeclarations } from './parsers/dependency-resolver'
export { autoCloseTags } from './utils/element'
export { getANodeProps, getANodePropByName } from './utils/anode'
export { Emitter } from './utils/emitter'
export { execCommandSync } from './loaders/exec'

// class types
export { SanSourceFile } from './models/san-sourcefile'
export { SanApp } from './models/san-app'
export { SanProject } from './models/san-project'
export { Compiler } from './models/compiler'
export { SanComponent, SanSSRFiltersDeclarations, SanSSRComputedDeclarations, isComponentLoader, COMPONENT_RESERVED_MEMBERS } from './models/component'
export { Expression } from './models/expression'
export { ANode } from './models/anode'

/**
 * Legacy API: compile a ComponentClass to a renderer function body
 */
export function compileToSource (ComponentClass: typeof Component): string {
    const proj = new SanProject()
    const targetCode = proj.compileToSource(ComponentClass, 'js', {
        bareFunction: true
    })
    return targetCode
}

/**
 * Legacy API: compile a ComponentClass to a function string and eval that function
 */
export function compileToRenderer (ComponentClass: typeof Component): Renderer {
    const proj = new SanProject({ tsConfigFilePath: null })
    const renderer = proj.compileToRenderer(ComponentClass)
    return renderer
}
