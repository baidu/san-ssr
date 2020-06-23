import { SanProject } from '../models/san-project'
import debugFactory from 'debug'
import { JSEmitter } from './js-emitter'
import { createRuntime, RUNTIME_FILES } from '../runtime/index'
import { ComponentClassCompiler } from './compilers/component-compiler'
import { SanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'
import { Compiler } from '../models/compiler'
import { ComponentInfo } from '../models/component-info'
import { RendererCompiler } from './compilers/renderer-compiler'
import { tsSourceFile2js } from '../transpilers/ts2js'
import { readStringSync } from '../utils/fs'
import { Emitter } from '../utils/emitter'

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
            this.emitMainRenderFunctionBody(sourceFile, ssrOnly, emitter)
        } else if (bareFunction) {
            emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => this.emitMainRenderFunctionBody(sourceFile, ssrOnly, emitter))
        } else {
            emitter.write('exports = module.exports = ')
            emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => this.emitMainRenderFunctionBody(sourceFile, ssrOnly, emitter))
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
        const sanSSRRuntime = createRuntime()

        for (const info of componentInfos) {
            const { id } = info
            sanSSRRuntime[`proto${id}`] = info.proto
            sanSSRRuntime[`renderer${id}`] = cc.compileComponentRenderer(info)
        }
        return (data: any, noDataOutput: boolean = false) => {
            const render = sanSSRRuntime[`renderer${entryComponentInfo.id}`]
            return render(data, noDataOutput, sanSSRRuntime)
        }
    }

    /**
     * 产生 SSR 代码的函数体，包括运行时、组件代码、组件 render 代码、入口组件调用
     */
    emitMainRenderFunctionBody (sourceFile: SanSourceFile, ssrOnly: boolean, emitter: JSEmitter) {
        const entryComponentInfo = sourceFile.entryComponentInfo
        if (!entryComponentInfo) throw new Error('entry component not found')

        this.emitRuntime(emitter, 'sanSSRRuntime')
        this.emitComponent(sourceFile, emitter)
        this.emitComponentRenderers(sourceFile.componentInfos, ssrOnly, emitter)
        this.emitComponentRendererCall(entryComponentInfo, emitter)
    }

    /**
     * 产出组件 class 的代码，即组件所在文件的运行时代码
     */
    private emitComponent (sourceFile: SanSourceFile, emitter: JSEmitter) {
        if (isTypedSanSourceFile(sourceFile)) this.compileTypeScriptToSource(sourceFile, emitter)
        else this.compileComponentClassToSource(sourceFile, emitter)
    }

    private compileTypeScriptToSource (sourceFile: TypedSanSourceFile, emitter: JSEmitter) {
        emitter.nextLine('(')
        emitter.writeAnonymousFunction(['exports'], () => {
            const dst = tsSourceFile2js(sourceFile.tsSourceFile, this.project.getCompilerOptionsOrThrow())
            emitter.writeLines(dst)

            for (const info of sourceFile.componentInfos) {
                const className = info.classDeclaration.getName()
                emitter.writeLine(`sanSSRRuntime.proto${info.id} = Object.assign(${className}.prototype, ${className})`)
            }
        })
        emitter.feedLine(')({});')
    }

    private compileComponentClassToSource (sourceFile: DynamicSanSourceFile, emitter: JSEmitter) {
        const cc = new ComponentClassCompiler(emitter)
        for (const info of sourceFile.componentInfos) {
            emitter.writeBlock(`sanSSRRuntime.proto${info.id} =`, () => cc.compile(info))
        }
    }

    /**
     * 出源文件中所有组件的 renderer 代码
     */
    private emitComponentRenderers (componentInfos: ComponentInfo[], ssrOnly: boolean, emitter: JSEmitter) {
        const cc = new RendererCompiler(ssrOnly, emitter)
        for (const info of componentInfos) {
            emitter.nextLine(`sanSSRRuntime.renderer${info.id} = `)
            cc.compileComponentRendererSource(info)
        }
    }

    /**
     * 产出组件调用代码
     */
    private emitComponentRendererCall (componentInfo: ComponentInfo, emitter: JSEmitter) {
        const funcName = 'sanSSRRuntime.renderer' + componentInfo.id
        emitter.writeLine(`return ${funcName}(data, noDataOutput, sanSSRRuntime)`)
    }

    /**
     * 产出运行时代码
     */
    private emitRuntime (emitter: Emitter, name: string) {
        emitter.writeLine(`var ${name} = {};`)
        for (const file of RUNTIME_FILES) {
            emitter.writeLine(`!(function (exports) {`)
            emitter.indent()
            emitter.writeLines(readStringSync(file))
            emitter.unindent()
            emitter.writeLine(`})(${name});`)
        }
    }
}
