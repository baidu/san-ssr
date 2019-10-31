import { JSEmitter } from '../emitters/js-emitter'
import { generateRenderFunction } from './js-render-compiler'
import { Project } from 'ts-morph'
import { getDefaultConfigPath } from '../parsers/tsconfig'
import { sep } from 'path'
import debugFactory from 'debug'
import { SanApp } from '../models/san-app'
import { Compiler } from './compiler'
import { emitRuntimeInJS } from '../emitters/runtime'

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
            emitRuntimeInJS(emitter)
            emitter.writeLines(generateRenderFunction(sanApp.getEntryComponentClass()))
        })
        return emitter.fullText()
    }
}
