import { removeObjectLiteralInitiator } from '../utils/ast-util'
import { SanSourceFile } from '../parsers/san-sourcefile'
import { isReserved } from '../utils/php-util'

const uselessComponentProps = ['components']

export function transformAstToPHP (sourceFile: SanSourceFile) {
    sourceFile.fakeProperties.forEach(prop => prop.remove())

    for (const clazz of sourceFile.componentClasses.values()) {
        for (const useless of uselessComponentProps) {
            const comps = clazz.getStaticProperty(useless)
            if (comps) comps.remove()
        }

        for (const prop of clazz.getProperties()) {
            removeObjectLiteralInitiator(sourceFile.origin, clazz, prop)
        }
    }

    for (const clazz of sourceFile.getClasses()) {
        const name = clazz.getName()
        if (isReserved(name)) {
            if (clazz.isExported()) {
                throw new Error(`${name} is a reserved keyword in PHP`)
            }
            clazz.rename(`SanSSRClass${name}`)
        }
    }
}
