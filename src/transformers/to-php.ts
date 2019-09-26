import { removeObjectLiteralInitiator } from '../parser/ast-util'
import { SanSourceFile } from '../parser/san-sourcefile'

const reservedNames = ['List']
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
        if (reservedNames.includes(name)) {
            if (clazz.isExported()) {
                throw new Error(`${name} is a reserved keyword in PHP`)
            }
            clazz.rename(`SpsrClass${name}`)
        }
    }
}
