import { SanSourceFile, DynamicSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'

/**
 * 目标代码生成器
 *
 * 内置的 target-js 在 src/target-js/index.ts
 * 已有的 target-php 在 github.com/searchfe/san-ssr-target-php
 */
export interface TargetCodeGenerator {
    compileToSource (sourceFile: SanSourceFile, options?: any): string;
    compileToRenderer? (sourceFile: DynamicSanSourceFile, options?: any): Renderer;
    emitHelpers? (options?: any): string;
}
