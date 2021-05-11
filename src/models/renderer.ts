/**
 * SanProject#compileToRenderer() 输出的 renderer 的类型声明
 */
export interface Renderer {
    (data: { [key: string]: any }, noDataOutput?: boolean): string
}
