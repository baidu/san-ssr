/**
 * Types for TypeScript tranpilation use
 */

export class SanSSRFiltersDeclarations {
    [key: string]: (...args: any[]) => any
}

export class SanSSRComputedDeclarations {
    [key: string]: (sanssrSelf: SanComponent) => any
}

export class SanComponent {
    public data: SanData;
}

class SanData {
    public get (path: string): any {
        return path
    }
}