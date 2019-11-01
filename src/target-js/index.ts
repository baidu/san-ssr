import { JSEmitter } from './emitters/emitter'
import { Project } from 'ts-morph'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { sep } from 'path'
import debugFactory from 'debug'
import { SanApp } from '../models/san-app'
import { Compiler } from '..'
import { emitRuntime } from './emitters/runtime'
import { RendererCompiler } from './compilers/renderer-compiler'

const debug = debugFactory('to-js-compiler')

export type ToJSCompilerOptions = {
    tsConfigFilePath?: string,
    project: Project
}

export class ToJSCompiler implements Compiler {
    private root: string
    private tsConfigFilePath: object
    private project: Project

    constructor ({
        tsConfigFilePath = getDefaultConfigPath(),
        project
    }: ToJSCompilerOptions) {
        this.root = tsConfigFilePath.split(sep).slice(0, -1).join(sep)
        this.project = project
        this.tsConfigFilePath = require(tsConfigFilePath)
    }

    public compile (sanApp: SanApp) {
        const emitter = new JSEmitter()
        emitter.write('module.exports = ')
        emitter.writeAnonymousFunction(['data', 'noDataOutput'], () => {
            emitRuntime(emitter)
            for (let i = 0; i < sanApp.componentClasses.length; i++) {
                const componentClass = sanApp.componentClasses[i]
                emitter.writeLines(new RendererCompiler(componentClass).compileComponentSource())
            }
            const funcName = 'sanssrRenderer' + sanApp.getEntryComponentClassOrThrow().sanssrCid
            emitter.writeLine(`return ${funcName}(data, noDataOutput)`)
        })
        return emitter.fullText()
    }
}
