import { SanProject } from '../models/san-project'
import debugFactory from 'debug'
import { JSEmitter } from './emitters/emitter'
import { _ } from '../utils/underscore'
import { SanData } from '../models/san-data'
import { Renderer } from '../models/renderer'
import { Compiler } from '../models/compiler'
import { SanApp } from '../models/san-app'
import { emitRuntime } from './emitters/runtime'
import { RendererCompiler } from './compilers/renderer-compiler'

const debug = debugFactory('target-js')

export type ToJSCompileOptions = {
    ssrOnly?: boolean
}

export type ToJSConstructOptions = {
    project: SanProject
}

export default class ToJSCompiler implements Compiler {
    private project: SanProject

    constructor ({
        project
    }: ToJSConstructOptions) {
        this.project = project
    }

    public compile (sanApp: SanApp, {
        ssrOnly = false,
        bareFunction = false,
        bareFunctionBody = false
    }) {
        const emitter = new JSEmitter()
        if (bareFunctionBody) emitFunctionBody()
        else if (bareFunction) {
            emitter.writeAnonymousFunction(['data', 'noDataOutput'], emitFunctionBody)
        } else {
            emitter.write('exports = module.exports = ')
            emitter.writeAnonymousFunction(['data', 'noDataOutput'], emitFunctionBody)
        }

        function emitFunctionBody () {
            emitRuntime(emitter, 'sanssrRuntime')
            const cc = new RendererCompiler(ssrOnly, sanApp.componentTree, emitter)
            for (const info of sanApp.componentTree.preOrder()) {
                const { cid } = info
                emitter.writeBlock(`sanssrRuntime.prototype${cid} =`, () => {
                    cc.compileComponentPrototypeSource(info)
                })
                emitter.nextLine(`sanssrRuntime.renderer${cid} = `)
                cc.compileComponentSource(info)
            }
            const funcName = 'sanssrRuntime.renderer' + sanApp.componentTree.root.cid
            emitter.writeLine(`return ${funcName}(data, noDataOutput, sanssrRuntime)`)
        }

        return emitter.fullText()
    }

    public compileToRenderer (sanApp: SanApp, {
        ssrOnly = false
    }: ToJSCompileOptions = {}): Renderer {
        const sanssrRuntime = { _, SanData }
        const cc = new RendererCompiler(ssrOnly, sanApp.componentTree)

        for (const info of sanApp.componentTree.preOrder()) {
            const { cid } = info
            sanssrRuntime[`prototype${cid}`] = info.proto
            sanssrRuntime[`renderer${cid}`] = cc.compileComponentRenderer(info)
        }
        const entryComponentId = sanApp.componentTree.root.cid
        return (data: any, noDataOutput: boolean = false) => {
            const render = sanssrRuntime[`renderer${entryComponentId}`]
            return render(data, noDataOutput, sanssrRuntime)
        }
    }
}
