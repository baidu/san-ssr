import { JSEmitter } from './emitters/emitter'
import { Project } from 'ts-morph'
import { sep } from 'path'
import debugFactory from 'debug'
import { Compiler } from '../models/compiler'
import { SanApp } from '../models/san-app'
import { emitRuntime } from './emitters/runtime'
import { RendererCompiler } from './compilers/renderer-compiler'

const debug = debugFactory('target-js')

export type ToJSCompilerOptions = {
    tsConfigFilePath?: string,
    project: Project
}

export default class ToJSCompiler implements Compiler {
    private root: string
    private tsConfigFilePath: object
    private project: Project

    constructor ({
        tsConfigFilePath,
        project
    }: ToJSCompilerOptions) {
        this.root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
        this.project = project
        this.tsConfigFilePath = require(tsConfigFilePath)
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
