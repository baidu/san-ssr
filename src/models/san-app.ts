import { SanSourceFile } from '../models/san-source-file'
import { ComponentTree } from './component-tree'

export class SanApp {
    public readonly entrySourceFile: SanSourceFile
    public readonly projectFiles: Map<string, SanSourceFile>
    public readonly componentTree: ComponentTree

    constructor (
        entrySourceFile: SanSourceFile,
        projectFiles: Map<string, SanSourceFile>,
        componentTree: ComponentTree
    ) {
        this.entrySourceFile = entrySourceFile
        this.projectFiles = projectFiles
        this.componentTree = componentTree
    }

    public getEntryComponentClass () {
        return this.componentTree.root.componentClass
    }
}
