import { SanSourceFile, isTypedSanSourceFile } from '../models/san-source-file'
import debugFactory from 'debug'

const debug = debugFactory('san-ssr:remove-modules')

/**
 * 删除模块引用
 */
export function removeModules (sanSourceFile: SanSourceFile, modules: RegExp[]) {
    if (!isTypedSanSourceFile(sanSourceFile)) {
        debug('TypedSanSourceFile is required')
        return
    }
    const importDeclarations = sanSourceFile.tsSourceFile.getImportDeclarations()
    debug('removing modules', importDeclarations)
    importDeclarations.forEach(i => {
        const specifierValue = i.getModuleSpecifierValue()
        if (modules.some(re => re.test(specifierValue))) {
            debug(`remove ${specifierValue}`)
            i.remove()
        }
    })
}
