import { TypeGuards, PropertyDeclaration } from 'ts-morph'

export function refactorComputedProperty (computed: PropertyDeclaration, sanssr = 'san-ssr') {
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
                type: `import("${sanssr}").SanComponent`
            })
            const text = body
                .getBodyText()
                .replace(/this\.data\.get\(/g, 'sanssrSelf.data.get(')
            body.setBodyText(text)
        }
    }
}
