export function getComponentClassIdentifier (sourceFile): string | undefined {
    const declaration = sourceFile.getImportDeclaration(
        node => node.getModuleSpecifierValue() === 'san'
    )
    if (!declaration) return
    const namedImports = declaration.getNamedImports()
    for (const namedImport of namedImports) {
        const propertyName = namedImport.getText()
        if (propertyName === 'Component') {
            return namedImport.getText()
        }
    }
}
