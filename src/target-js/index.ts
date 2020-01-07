import { JSEmitter } from './emitters/emitter'
import { _ } from './utils/underscore'
import { SanData } from '../models/san-data'
import { Renderer } from '../models/renderer'
import { Project } from 'ts-morph'
import debugFactory from 'debug'
import { Compiler } from '../models/compiler'
import { SanApp } from '../models/san-app'
import { emitRuntime } from './emitters/runtime'
import { RendererCompiler } from './compilers/renderer-compiler'

const debug = debugFactory('target-js')

export type ToJSCompileOptions = {
    noTemplateOutput?: boolean
}

export type ToJSConstructOptions = {
    project: Project
}

export default class ToJSCompiler implements Compiler {
    private project: Project

    constructor ({
        project
    }: ToJSConstructOptions) {
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
            for (const ComponentClass of sanApp.componentClasses) {
                const cc = new RendererCompiler(ComponentClass, noTemplateOutput)

                emitter.writeBlock(`sanssrRuntime.prototype${ComponentClass.sanssrCid} =`, () => {
                    cc.compileComponentPrototypeSource(emitter)
                })
                emitter.nextLine(`sanssrRuntime.renderer${ComponentClass.sanssrCid} = `)
                cc.compileComponentSource(emitter)
            }
            const funcName = 'sanssrRuntime.renderer' + sanApp.getEntryComponentClassOrThrow().sanssrCid
            emitter.writeLine(`return ${funcName}(data, noDataOutput, sanssrRuntime)`)
        })
        return emitter.fullText()
    }

    public compileToRenderer (sanApp: SanApp, {
        noTemplateOutput = false
    }: ToJSCompileOptions = {}): Renderer {
        const sanssrRuntime = { _, SanData }

        for (const ComponentClass of sanApp.componentClasses) {
            const cc = new RendererCompiler(ComponentClass, noTemplateOutput)
            sanssrRuntime[`prototype${ComponentClass.sanssrCid}`] = cc.component
            sanssrRuntime[`renderer${ComponentClass.sanssrCid}`] = cc.compileComponentRenderer()
        }
        const entryComponentId = sanApp.getEntryComponentClassOrThrow().sanssrCid
        return (data: any, noDataOutput: boolean) => {
            const func = sanssrRuntime[`renderer${entryComponentId}`]
            return func(data, noDataOutput, sanssrRuntime)
        }
    }
}
