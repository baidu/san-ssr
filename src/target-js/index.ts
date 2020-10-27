import { SanProject } from '../models/san-project'
import debugFactory from 'debug'
import { JSEmitter } from './js-emitter'
import { createRuntime, emitRuntime } from '../runtime/index'
import { ComponentClassCompiler } from './compilers/component-compiler'
import { SanSourceFile, JSSanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile, isJSSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'
import { Compiler } from '../models/compiler'
import { RendererCompiler } from './compilers/renderer-compiler'
import { tsSourceFile2js } from '../transpilers/ts2js'

const debug = debugFactory('target-js')

export type ToJSCompileOptions = {
    ssrOnly?: boolean
}

export default class ToJSCompiler implements Compiler {
    constructor (private project: SanProject) {}

    /**
     * 编译到 JS Render 源码
     *
     * @param sourceFile 解析过的 San 源文件
     * @param ssrOnly 只在服务端渲染，客户端无法反解，可用来减少渲染标记
     * @param bareFunction 只输出一个 function，不输出 CMD 包装
     * @param bareFunctionBody 只输出 function body
     */
    public compileToSource (sourceFile: SanSourceFile, {
        ssrOnly = false,
        bareFunction = false,
        bareFunctionBody = false
    } = {}) {
        const emitter = new JSEmitter()
        if (bareFunctionBody) {
            emitter.writeLine('let exports = {}, module = { exports };')
            this.doCompileToSource(sourceFile, ssrOnly, emitter)
            emitter.writeLine('return module.exports(data, noDataOutput);')
        } else if (bareFunction) {
            emitter.writeFunction('render', ['data', 'noDataOutput'], () => {
                emitter.writeLine('let exports = {}, module = { exports };')
                this.doCompileToSource(sourceFile, ssrOnly, emitter)
                emitter.writeLine('return module.exports(data, noDataOutput);')
            })
        } else {
            this.doCompileToSource(sourceFile, ssrOnly, emitter)
        }
        return emitter.fullText()
    }

    /**
     * 编译到 JS Render 函数
     *
     * @param sourceFile 解析过的 San 源文件
     * @param ssrOnly 只在服务端渲染，客户端无法反解，可用来减少渲染标记
     */
    public compileToRenderer (sourceFile: DynamicSanSourceFile, {
        ssrOnly = false
    }: ToJSCompileOptions = {}): Renderer {
        const { componentInfos, entryComponentInfo } = sourceFile
        const cc = new RendererCompiler(ssrOnly)
        const runtime = createRuntime()

        for (const info of componentInfos) {
            const { id } = info
            runtime.resolver.setPrototype(id, info.componentClass.prototype)
            runtime.resolver.setRenderer(id, cc.compileComponentRenderer(info))
        }
        return (data: any, noDataOutput: boolean = false) => {
            const render = runtime.resolver.getRenderer(entryComponentInfo.id)
            return render(data, noDataOutput, runtime)
        }
    }

    private doCompileToSource (sourceFile: SanSourceFile, ssrOnly: boolean, emitter: JSEmitter) {
        // 如果源文件中有 san 组件，才输出一个运行时
        if (sourceFile.componentInfos.length) emitRuntime(emitter)

        // 编译源文件到 JS
        if (isTypedSanSourceFile(sourceFile)) this.compileTSComponentToSource(sourceFile, emitter)
        else if (isJSSanSourceFile(sourceFile)) this.compileJSComponentToSource(sourceFile, emitter)
        // DynamicSanSourceFile
        else this.compileComponentClassToSource(sourceFile, emitter)

        // 编译 render 函数
        const cc = new RendererCompiler(ssrOnly, emitter)
        for (const info of sourceFile.componentInfos) {
            emitter.nextLine(`sanSSRRuntime.resolver.setRenderer("${info.id}", `)
            cc.compileComponentRendererSource(info)
            emitter.feedLine(');')
        }

        // 导出入口 render 函数
        const entryInfo = sourceFile.entryComponentInfo
        if (entryInfo) {
            emitter.writeLine(`module.exports = Object.assign(sanSSRRuntime.resolver.getRenderer("${entryInfo.id}"), exports)`)
        }
    }

    private compileTSComponentToSource (sourceFile: TypedSanSourceFile, emitter: JSEmitter) {
        const dst = tsSourceFile2js(sourceFile.tsSourceFile, this.project.getCompilerOptionsOrThrow())
        emitter.writeLines(dst)

        for (const info of sourceFile.componentInfos) {
            const className = info.classDeclaration.getName()
            emitter.writeLine(`sanSSRRuntime.resolver.setPrototype("${info.id}", sanSSRRuntime._.createInstanceFromClass(${className}));`)
        }
    }

    private compileJSComponentToSource (sourceFile: JSSanSourceFile, emitter: JSEmitter) {
        emitter.writeLines(sourceFile.getFileContent())

        for (const info of sourceFile.componentInfos) {
            const proto = info.className ? info.className : info.sourceCode
            emitter.writeLine(`sanSSRRuntime.resolver.setPrototype("${info.id}", sanSSRRuntime._.createInstanceFromClass(${proto}));`)
        }
    }

    private compileComponentClassToSource (sourceFile: DynamicSanSourceFile, emitter: JSEmitter) {
        const cc = new ComponentClassCompiler(emitter)
        for (const info of sourceFile.componentInfos) {
            emitter.nextLine(`sanSSRRuntime.resolver.setPrototype("${info.id}", `)
            emitter.writeBlock('', () => cc.compile(info), false)
            emitter.feedLine(');')
        }
    }
}
