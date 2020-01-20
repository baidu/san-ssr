import { TSSanAppParser } from '../../src/parsers/ts-san-app-parser'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe('TSSanAppParser', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const project = new Project({ tsConfigFilePath })

    it('should add sanssrCid static property', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.projectFiles.size).toEqual(1)
        expect(sanApp.entrySourceFile.getFullText()).toContain('static sanssrCid')
    })

    it('should eval component classes', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.getEntryComponentClass()).toHaveProperty('sanssrCid', 0)
    })

    it('should throw for invalid component', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../stub/foo.ts')

        expect(() => parser.parseSanApp(filepath))
            .toThrow(/not likely a San Component/)
    })
})
