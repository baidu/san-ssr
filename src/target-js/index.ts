import { JSEmitter } from './emitters/emitter'
import { Project } from 'ts-morph'
import debugFactory from 'debug'
import { Compiler } from '../models/compiler'
import { SanApp } from '../models/san-app'
import { emitRuntime } from './emitters/runtime'
import { RendererCompiler } from './compilers/renderer-compiler'

const debug = debugFactory('target-js')

export type ToJSCompilerOptions = {
    project: Project
}

export default class ToJSCompiler implements Compiler {
    private project: Project

    constructor ({
        project
    }: ToJSCompilerOptions) {
        this.project = project
    }

    public compile (sanApp: SanApp, {
        noTemplateOutput = false,
        bareFunction = false
    }) {
        const emitter = new JSEmitter()
        if (!bareFunction) {
            emitter.write('exports = module.exports = ')
        }
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitRuntime(emitter)
            for (const componentClass of sanApp.componentClasses) {
                const renderCompiler = new RendererCompiler(componentClass, noTemplateOutput)
                emitter.writeLines(renderCompiler.compileComponentSource())
            }
            const funcName = 'sanssrRenderer' + sanApp.getEntryComponentClassOrThrow().sanssrCid
            emitter.writeLine(`return ${funcName}(data, noDataOutput)`)
        })
        return emitter.fullText()
    }
}
