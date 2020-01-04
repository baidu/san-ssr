import { JSEmitter } from './emitters/emitter'
import { Renderer } from '../models/renderer'
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
            emitRuntime(emitter, 'sanssrRuntime')
            for (const componentClass of sanApp.componentClasses) {
                const cc = new RendererCompiler(componentClass, noTemplateOutput)
                emitter.writeBlock(`sanssrRuntime.instance${componentClass.sanssrCid} =`, () => {
                    cc.compileComponentInstanceSource(emitter)
                })

                emitter.nextLine(`sanssrRuntime.renderer${componentClass.sanssrCid} = `)
                emitter.indent()
                cc.compileComponentRendererSource(emitter)
                emitter.unindent()
            }
            const funcName = 'sanssrRuntime.renderer' + sanApp.getEntryComponentClassOrThrow().sanssrCid
            emitter.writeLine(`return ${funcName}(sanssrRuntime, data, noDataOutput)`)
        })
        return emitter.fullText()
    }

    public compileToRenderer (sanApp: SanApp, {
        noTemplateOutput = false
    }): Renderer {
        const renderers: Map<number, Renderer> = new Map()

        for (const componentClass of sanApp.componentClasses) {
            const renderCompiler = new RendererCompiler(componentClass, noTemplateOutput, renderers)
            const componentRenderer = renderCompiler.compileComponentRenderer()
            // renderers.set(componentClass.sanssrCid, componentRenderer)
        }
        const entryComponentId = sanApp.getEntryComponentClassOrThrow().sanssrCid
        return renderers.get(entryComponentId)
    }
}
