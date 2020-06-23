import { ClassDeclaration } from 'ts-morph'

export function normalizeComponentClass (clazz: ClassDeclaration) {
    if (!clazz.getName()) {
        // clazz.rename('SanSSRMyComponent')
        throw new Error('anonymous component class is not supported, refer to https://github.com/dsherret/ts-morph/pull/799')
    }

    for (const prop of clazz.getProperties()) {
        const name = prop.getName()

        if (name === 'filters' || name === 'computed') {
            if (!prop.isStatic()) prop.setIsStatic(true)
        }
    }
    return clazz
}
