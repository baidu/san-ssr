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
            for (const info of sanApp.componentTree.preOrder()) {
                const { cid } = info
                const cc = new RendererCompiler(info, noTemplateOutput, sanApp.componentTree)

                emitter.writeBlock(`sanssrRuntime.prototype${cid} =`, () => {
                    cc.compileComponentPrototypeSource(emitter)
                })
                emitter.nextLine(`sanssrRuntime.renderer${cid} = `)
                cc.compileComponentSource(emitter)
            }
            const funcName = 'sanssrRuntime.renderer' + sanApp.componentTree.root.cid
            emitter.writeLine(`return ${funcName}(data, noDataOutput, sanssrRuntime)`)
        })
        return emitter.fullText()
    }

    public compileToRenderer (sanApp: SanApp, {
        noTemplateOutput = false
    }: ToJSCompileOptions = {}): Renderer {
        const sanssrRuntime = { _, SanData }

        for (const info of sanApp.componentTree.preOrder()) {
            const { cid } = info
            const cc = new RendererCompiler(info, noTemplateOutput, sanApp.componentTree)
            sanssrRuntime[`prototype${cid}`] = cc.component
            sanssrRuntime[`renderer${cid}`] = cc.compileComponentRenderer()
        }
        const entryComponentId = sanApp.componentTree.root.cid
        return (data: any, noDataOutput: boolean = false) => {
            const render = sanssrRuntime[`renderer${entryComponentId}`]
            return render(data, noDataOutput, sanssrRuntime)
        }
    }
}
