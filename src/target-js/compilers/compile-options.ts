import { RenderOptions } from '../../compilers/renderer-options'

export interface CompileOptions extends RenderOptions {
    bareFunction?: boolean
    bareFunctionBody?: boolean
}
