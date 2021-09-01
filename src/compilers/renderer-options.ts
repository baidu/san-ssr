/**
 * RendererCompiler 的参数
 *
 * 用来指定生成怎样的 renderer，比如函数名是啥，是否不用支持反解，要忽略哪些模块
 */
export interface RenderOptions {
    functionName?: string
    ssrOnly?: boolean
    importHelpers?: string
    /**
     * 使用调用 render 时提供的组件类，编译产物中不再包含组件类
     */
    useProvidedComponentClass?: boolean
    /**
     * 删除 ssr 不需要引入的模块，仅对 TypedSanSourceFile 有效
     */
    removeModules?: RegExp[]

    sanReferenceInfo?: {
        methodName?: string
        moduleName?: string
        className?: string
    }
    /**
     * 不同 target 实现的 CompilerOptions 可以继承并扩充字段
     */
    [key: string]: any;
}

export interface parseSanSourceFileOptions {
    sanReferenceInfo?: RenderOptions['sanReferenceInfo']
}
