import { removeObjectLiteralInitiator } from '../utils/ast-util'
import { SanSourceFile } from '../models/san-sourcefile'
import { isReserved } from '../utils/php-util'
import { TypeGuards, PropertyDeclaration } from 'ts-morph'

const uselessComponentProps = ['components']

export function transformAstToPHP (sourceFile: SanSourceFile, sanssr = 'san-ssr') {
    sourceFile.fakeProperties.forEach(prop => prop.remove())

    for (const clazz of sourceFile.componentClasses.values()) {
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

function refactorFiltersProperty (filters: PropertyDeclaration, sanssr = 'san-ssr') {
    filters.setType(`import("${sanssr}").SanSSRFiltersDeclarations`)
}

function refactorComputedProperty (computed: PropertyDeclaration, sanssr = 'san-ssr') {
    computed.setType(`import("${sanssr}").SanSSRComputedDeclarations`)

    const computedDefinitions = computed.getInitializer()
    if (!computedDefinitions) return
    if (!TypeGuards.isObjectLiteralExpression(computedDefinitions)) return
    for (const prop of computedDefinitions.getProperties()) {
        let body
        if (TypeGuards.isMethodDeclaration(prop)) {
            body = prop
        }
        if (TypeGuards.isPropertyAssignment(prop)) {
            const init = prop.getInitializer()
            if (TypeGuards.isFunctionExpression(init)) body = init
        }
        if (body) {
            body.insertParameter(0, {
                name: 'sanssrSelf',
                type: `import("${sanssr}").Component`
            })
            const text = body
                .getBodyText()
                .replace(/this\.data\.get\(/g, 'sanssrSelf.data.get(')
            body.setBodyText(text)
        }
    }
}
