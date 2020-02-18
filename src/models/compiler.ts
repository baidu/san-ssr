import { SanApp } from '../models/san-app'
import { Renderer } from '../models/renderer'

export interface Compiler {
    compile (sanApp: SanApp, options?: any): string;
    compileToRenderer? (sanApp: SanApp, options?: any): Renderer;
}
