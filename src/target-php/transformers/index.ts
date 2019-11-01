import { isReserved, removeObjectLiteralInitiator } from '../util'
import { SanSourceFile } from '../..'
import { refactorFiltersProperty } from './refactor-filters-property'
import { refactorComputedProperty } from './refactor-computed-property'

const uselessComponentProps = ['components']

export function transformAstToPHP (sourceFile: SanSourceFile) {
    sourceFile.fakeProperties.forEach(prop => prop.remove())

    const sanssr = process.env.SAN_SSR_PACKAGE_NAME || 'san-ssr'

    for (const clazz of sourceFile.componentClassDeclarations.values()) {
        for (const useless of uselessComponentProps) {
            const comps = clazz.getStaticProperty(useless)
            if (comps) comps.remove()
        }

        for (const prop of clazz.getProperties()) {
            if (prop.getName() === 'computed') {
                refactorComputedProperty(prop, sanssr)
            } else if (prop.getName() === 'filters') {
                refactorFiltersProperty(prop, sanssr)
            }
            removeObjectLiteralInitiator(sourceFile.tsSourceFile, clazz, prop)
        }
    }

    for (const clazz of sourceFile.getClassDeclarations()) {
        const name = clazz.getName()
        if (isReserved(name)) {
            if (clazz.isExported()) {
                throw new Error(`${name} is a reserved keyword in PHP`)
            }
            clazz.rename(`SanSSRClass${name}`)
        }
    }
}
