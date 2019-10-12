export interface Compiler {
    compileFromTS (filepath: string, options?: any);
    compileFromJS (filepath: string);
    compile(filepath: string);
}
