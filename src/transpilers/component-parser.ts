import { getComponentClassIdentifier } from './ast-util'
import { Project, ts, SourceFile } from 'ts-morph'
import { getDefaultConfigPath } from './tsconfig'

export class ComponentParser {
    private componentFile: string
    private root: string
    private tsconfigPath: string
    private project: Project
    private idPropertyName: string
    private id: number = 0

    constructor (
        componentFile: string,
        tsconfigPath = getDefaultConfigPath(),
        idPropertyName = 'spsrId'
    ) {
        this.idPropertyName = idPropertyName
        this.componentFile = componentFile
        this.tsconfigPath = tsconfigPath
        this.project = new Project({
            tsConfigFilePath: tsconfigPath
        })
    }

    parseComponent () {
        const files = this.getComponentFiles()
        for (const file of files.values()) {
            const componentClassIdentifier = getComponentClassIdentifier(file)
            if (!componentClassIdentifier) continue
            this.markComponents(file, componentClassIdentifier)
        }
        return files
    }

    private getComponentFiles () {
        return new Map([[
            this.componentFile,
            this.project.getSourceFile(this.componentFile)
        ]])
    }

    private markComponents (sourceFile: SourceFile, componentClassIdentifier: string) {
        for (const clazz of sourceFile.getClasses()) {
            const extendClause = clazz.getHeritageClauseByKind(ts.SyntaxKind.ExtendsKeyword)
            if (!extendClause) return

            const typeNode = extendClause.getTypeNodes().find(x => x.getText() === componentClassIdentifier)
            if (!typeNode) return

            clazz.addProperty({
                isStatic: true,
                name: this.idPropertyName,
                type: 'number',
                initializer: '' + (this.id++)
            })
        }
    }
}
