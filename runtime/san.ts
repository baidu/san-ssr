/**
 * Types for TypeScript tranpilation use
 */

export class SanSSRFiltersDeclarations {
    [key: string]: (...args: any[]) => any
}

export class SanSSRComputedDeclarations {
    [key: string]: (sanssrSelf: Component) => any
}

class Component {
    public data: Data;
}

class Data {
    public get (path: string): any {
        return path
    }
}