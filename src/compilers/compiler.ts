import { SanApp } from '../parsers/san-app'

export interface Compiler {
    compile (sanApp: SanApp, options?: any);
}
