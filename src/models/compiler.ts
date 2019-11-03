import { SanApp } from '../models/san-app'

export interface Compiler {
    compile (sanApp: SanApp, options?: any);
}
