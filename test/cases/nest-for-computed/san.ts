export class Data {
    public get (path: string): any {
        return path
    }
}

export class Component {
    public data: Data;
}

export class FilterDeclarations {
    [key: string]: (this: Component, ...args: any[]) => any
}