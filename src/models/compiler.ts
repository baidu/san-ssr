import { SanSourceFile, DynamicSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'

export interface Compiler {
    compileToSource (sourceFile: SanSourceFile, options?: any): string;
    compileToRenderer? (sourceFile: DynamicSanSourceFile, options?: any): Renderer;
}
