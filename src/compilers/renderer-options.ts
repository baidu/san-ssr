export interface RenderOptions {
    functionName?: string
    ssrOnly?: boolean
    importHelpers?: string
    /**
     * 删除 ssr 不需要引入的模块，仅对 TypedSanSourceFile 有效
     */
    removeModules?: RegExp[]
    /**
     * 不同 target 实现的 CompilerOptions 可以继承并扩充字段
     */
    [key: string]: any;
    /**
     * 指定在 runtime 时 initData
     */
    initDataInRuntime?: true;
}
