export interface GlobalContext {
    customSSRFilePath?(path: string): string
    customComponentFilePath?(info: {specifier: string; id: string;}): string
}
