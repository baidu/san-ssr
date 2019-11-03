import { PropertyDeclaration } from 'ts-morph'

export function refactorFiltersProperty (filters: PropertyDeclaration, sanssr = 'san-ssr') {
    filters.setType(`import("${sanssr}").SanSSRFiltersDeclarations`)
}
