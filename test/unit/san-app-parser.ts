import { ToJSCompiler } from '../../src/target-js'
import { SanAppParser } from '../../src/parsers/san-app-parser'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe('SanAppParser', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const project = new Project({ tsConfigFilePath })

    it('should add sanssrCid static property', function () {
        const parser = new SanAppParser(project)
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.projectFiles.size).toEqual(1)
        expect(sanApp.entrySourceFile.getFullText()).toContain('static sanssrCid')
    })

    it('should eval component classes', function () {
        const parser = new SanAppParser(project)
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.componentClasses).toHaveLength(1)
        expect(sanApp.componentClasses[0]).toHaveProperty('sanssrCid', 0)
    })
})
