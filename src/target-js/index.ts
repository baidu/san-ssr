import { SanProject } from '../models/san-project'
import debugFactory from 'debug'
import { JSEmitter } from './js-emitter'
import { SanSSRHelpers, createHelpers, emitHelpers, emitHelpersAsIIFE } from '../runtime/create-helpers'
import type { Resolver } from '../runtime/resolver'
import { ComponentClassCompiler } from './compilers/component-compiler'
import { SanSourceFile, JSSanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile, isJSSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'
import { Compiler } from '../models/compiler'
import { RENDERER_ARGS, RendererCompiler } from '../compilers/renderer-compiler'
import { tsSourceFile2js } from '../compilers/ts2js'

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
        importHelpers = '',
        ssrOnly = false,
        bareFunction = false,
        bareFunctionBody = false
    } = {}) {
        const emitter = new JSEmitter()
        if (bareFunctionBody) {
            emitter.writeLine('let exports = {}, module = { exports };')
            this.doCompileToSource(sourceFile, ssrOnly, importHelpers, emitter)
            emitter.writeLine('return module.exports(data, noDataOutput);')
        } else if (bareFunction) {
            emitter.writeFunction('render', ['data', 'noDataOutput'], () => {
                emitter.writeLine('let exports = {}, module = { exports };')
                this.doCompileToSource(sourceFile, ssrOnly, importHelpers, emitter)
                emitter.writeLine('return module.exports(data, noDataOutput);')
            })
        } else {
            this.doCompileToSource(sourceFile, ssrOnly, importHelpers, emitter)
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
        const helpers = createHelpers()
        const resolver = helpers.createResolver({}, require)

        for (const info of componentInfos) {
            const { id } = info
            const cc = new RendererCompiler(ssrOnly)
            const renderFnBody = cc.compileComponentRendererBody(info)
            const render = this.createRender(renderFnBody, [helpers, resolver])

            resolver.setPrototype(id, info.componentClass.prototype)
            resolver.setRenderer(id, render)
        }
        return (data: any, noDataOutput: boolean = false) => {
            const render = resolver.getRenderer({ id: entryComponentInfo.id })
            return render(data, noDataOutput)
        }
    }

    public emitHelpers () {
        const emitter = new JSEmitter()
        emitHelpers(emitter)
        return emitter.fullText()
    }

    /**
     * 解决 render 函数的依赖（即 helpers）
     */
    private createRender (fnBody: string, args: [SanSSRHelpers, Resolver]): Renderer {
        const emitter = new JSEmitter()
        emitter.writeBlock(`return function(${RENDERER_ARGS.join(', ')})`, () => {
            emitter.writeLines(fnBody)
        })
        const argNames = ['sanSSRHelpers', 'sanSSRResolver']
        const body = emitter.fullText()
        const creator = new Function(...argNames, body) // eslint-disable-line no-new-func
        return creator(...args) as Renderer
    }

    private doCompileToSource (sourceFile: SanSourceFile, ssrOnly: boolean, importHelpers: string, emitter: JSEmitter) {
        // 如果源文件中有 san 组件，才输出一个运行时
        if (sourceFile.componentInfos.length) this.ensureHelpers(importHelpers, emitter)

        // 编译源文件到 JS
        if (isTypedSanSourceFile(sourceFile)) this.compileTSComponentToSource(sourceFile, emitter)
        else if (isJSSanSourceFile(sourceFile)) this.compileJSComponentToSource(sourceFile, emitter)
        // DynamicSanSourceFile
        else this.compileComponentClassToSource(sourceFile, emitter)

        // 编译 render 函数
        const cc = new RendererCompiler(ssrOnly, emitter)
        for (const info of sourceFile.componentInfos) {
            emitter.nextLine(`sanSSRResolver.setRenderer("${info.id}", `)
            cc.compileComponentRendererSource(info)
            emitter.feedLine(');')
        }

        // 导出入口 render 函数
        const entryInfo = sourceFile.entryComponentInfo
        if (entryInfo) {
            emitter.writeLine(`module.exports = Object.assign(sanSSRResolver.getRenderer({id:"${entryInfo.id}"}), exports)`)
        }
    }

    private ensureHelpers (importHelpers: string, emitter: JSEmitter) {
        emitter.nextLine('const sanSSRHelpers = ')
        if (importHelpers) {
            emitter.feedLine(`require("${importHelpers}");`)
        } else {
            emitHelpersAsIIFE(emitter)
        }
        emitter.writeLine('const sanSSRResolver = sanSSRHelpers.createResolver(exports, require);')
    }

    private compileTSComponentToSource (sourceFile: TypedSanSourceFile, emitter: JSEmitter) {
        const dst = tsSourceFile2js(sourceFile.tsSourceFile, this.project.getCompilerOptionsOrThrow())
        emitter.writeLines(dst)

        for (const info of sourceFile.componentInfos) {
            const className = info.classDeclaration.getName()
            emitter.writeLine(`sanSSRResolver.setPrototype("${info.id}", sanSSRHelpers._.createInstanceFromClass(${className}));`)
        }
    }

    private compileJSComponentToSource (sourceFile: JSSanSourceFile, emitter: JSEmitter) {
        emitter.writeLines(sourceFile.getFileContent())

        for (const info of sourceFile.componentInfos) {
            const proto = info.className ? info.className : info.sourceCode
            emitter.writeLine(`sanSSRResolver.setPrototype("${info.id}", sanSSRHelpers._.createInstanceFromClass(${proto}));`)
        }
    }

    private compileComponentClassToSource (sourceFile: DynamicSanSourceFile, emitter: JSEmitter) {
        const cc = new ComponentClassCompiler(emitter)
        for (const info of sourceFile.componentInfos) {
            emitter.nextLine(`sanSSRResolver.setPrototype("${info.id}", `)
            emitter.writeBlock('', () => cc.compile(info), false)
            emitter.feedLine(');')
        }
    }
}
