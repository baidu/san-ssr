import { SanSourceFile } from '../models/san-sourcefile'
import { Component, isComponentClass } from './component'

export class SanApp {
    public readonly entrySourceFile: SanSourceFile
    public readonly projectFiles: Map<string, SanSourceFile>
    public readonly componentClasses: typeof Component[]

    constructor (
        entrySourceFile: SanSourceFile,
        projectFiles: Map<string, SanSourceFile>,
        componentClasses: typeof Component[]
    ) {
        for (const clazz of componentClasses) {
            this.validateComponentClass(clazz)
        }

        this.entrySourceFile = entrySourceFile
        this.projectFiles = projectFiles
        this.componentClasses = componentClasses
    }

    public getEntryComponentClass () {
        return this.componentClasses[0]
    }

    public getEntryComponentClassOrThrow () {
        const clazz = this.getEntryComponentClass()
        if (typeof clazz !== 'function') {
            throw new Error('entry ComponentClass not found')
        }
        return clazz
    }

    private validateComponentClass (clazz: any) {
        if (isComponentClass(clazz)) return
        throw new Error('the input class is not likely a San Component')
    }
}
