/**
 * target-js 的代码生成器
 *
 * 从 renderer AST 生成 JavaScript 源代码。
 */
import { SanProject } from '../models/san-project'
import debugFactory from 'debug'
import { JSEmitter } from './js-emitter'
import { createHelpers, emitHelpers, emitHelpersAsIIFE } from '../runtime/create-helpers'
import { ComponentClassCompiler } from './compilers/component-compiler'
import { SanSourceFile, JSSanSourceFile, TypedSanSourceFile, DynamicSanSourceFile, isTypedSanSourceFile, isJSSanSourceFile } from '../models/san-source-file'
import { Renderer } from '../models/renderer'
import { TargetCodeGenerator } from '../models/target-code-generator'
import { tsSourceFile2js } from '../compilers/ts2js'
import { RenderOptions } from '../compilers/renderer-options'
import { CompileOptions } from './compilers/compile-options'
import { FunctionDefinition } from '../ast/renderer-ast-dfn'
import { bracketToDot } from '../optimizers/bracket-to-dot'

const debug = debugFactory('san-ssr:target-js')

export default class ToJSCompiler implements TargetCodeGenerator {
    constructor (private project: SanProject) {}

    /**
     * 编译到 JS Render 源码
     *
     * @param sourceFile 解析过的 San 源文件
     * @param ssrOnly 只在服务端渲染，客户端无法反解，可用来减少渲染标记
     * @param bareFunction 只输出一个 function，不输出 CMD 包装
     * @param bareFunctionBody 只输出 function body
     */
    public compileToSource (sourceFile: SanSourceFile, options: CompileOptions = {}) {
        const emitter = new JSEmitter()
        if (options.bareFunctionBody) {
            emitter.writeLine('let exports = {}, module = { exports };')
            this.doCompileToSource(sourceFile, options, emitter)
            emitter.writeLine('return module.exports(data, noDataOutput);')
        } else if (options.bareFunction) {
            emitter.writeFunction('render', ['data', 'noDataOutput'], () => {
                emitter.writeLine('let exports = {}, module = { exports };')
                this.doCompileToSource(sourceFile, options, emitter)
                emitter.writeLine('return module.exports(data, noDataOutput);')
            })
        } else {
            this.doCompileToSource(sourceFile, options, emitter)
        }
        return emitter.fullText()
    }

    /**
     * 编译到 JS Render 函数
     *
     * 注意：只支持 DynamicSanSourceFile，san-ssr 只对组件代码进行静态的编译，
     * 不会托管并执行组件代码，因此你需要把执行得到的入口组件传给 san-ssr。
     *
     * @param sourceFile 解析过的 San 源文件
     * @param options 渲染参数
     */
    public compileToRenderer (sourceFile: DynamicSanSourceFile, options: RenderOptions = {}): Renderer {
        const { componentInfos, entryComponentInfo } = sourceFile
        const sanSSRHelpers = createHelpers()
        const sanSSRResolver = sanSSRHelpers.createResolver({}, require)

        for (const info of componentInfos) {
            const emitter = new JSEmitter()
            emitter.writeFunctionDefinition(this.optimize(info.compileToRenderer(options)))

            const rawRendererText = emitter.fullText()
            const resolvedRenderer = this.createRenderer(rawRendererText, { sanSSRHelpers, sanSSRResolver })
            sanSSRResolver.setPrototype(info.id, info.componentClass.prototype)
            sanSSRResolver.setRenderer(info.id, resolvedRenderer)
        }
        return (data: any, noDataOutput: boolean = false) => {
            const render = sanSSRResolver.getRenderer({ id: entryComponentInfo.id })
            return render(data, noDataOutput)
        }
    }

    public emitHelpers () {
        const emitter = new JSEmitter()
        emitHelpers(emitter)
        return emitter.fullText()
    }

    /**
     * 解决 render 函数的依赖（即 helpers 和 resolver）
     */
    private createRenderer (fnString: string, context: any): Renderer {
        const varNames: any[] = Object.keys(context)
        const varValues: any[] = Object.values(context)
        const creator = new Function(...varNames, 'return ' + fnString) // eslint-disable-line no-new-func
        return creator(...varValues) as Renderer
    }

    private doCompileToSource (sourceFile: SanSourceFile, options: RenderOptions, emitter: JSEmitter) {
        // 如果源文件中有 san 组件，才输出一个运行时
        if (sourceFile.componentInfos.length) this.ensureHelpers(options.importHelpers, emitter)

        if (!options.useProvidedComponentClass) {
            // 编译源文件到 JS
            if (isTypedSanSourceFile(sourceFile)) this.compileTSComponentToSource(sourceFile, emitter)
            else if (isJSSanSourceFile(sourceFile)) this.compileJSComponentToSource(sourceFile, emitter)
            // DynamicSanSourceFile
            else this.compileComponentClassToSource(sourceFile, emitter)
        }

        // 编译 render 函数
        for (const info of sourceFile.componentInfos) {
            emitter.nextLine(`sanSSRResolver.setRenderer("${info.id}", `)
            emitter.writeFunctionDefinition(this.optimize(info.compileToRenderer(options)))
            emitter.feedLine(');')
        }

        // 导出入口 render 函数
        const entryInfo = sourceFile.entryComponentInfo
        if (entryInfo) {
            emitter.writeLine(`module.exports = Object.assign(sanSSRResolver.getRenderer({id:"${entryInfo.id}"}), exports)`)
        }
    }

    private ensureHelpers (importHelpers: string | undefined, emitter: JSEmitter) {
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
            const proto = info.isRawObject
                ? info.sourceCode
                : `sanSSRHelpers._.createInstanceFromClass(${info.className || info.sourceCode})`
            emitter.writeLine(`sanSSRResolver.setPrototype("${info.id}", ${proto});`)
        }
    }

    private compileComponentClassToSource (sourceFile: DynamicSanSourceFile, emitter: JSEmitter) {
        for (const info of sourceFile.componentInfos) {
            const cc = new ComponentClassCompiler(emitter)
            emitter.nextLine(`sanSSRResolver.setPrototype("${info.id}", `)
            emitter.writeBlock('', () => cc.compile(info), false)
            emitter.feedLine(');')
        }
    }

    private optimize (root: FunctionDefinition) {
        bracketToDot(root)
        return root
    }
}
