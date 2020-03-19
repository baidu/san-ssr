import { TSSanAppParser } from '../../../src/parsers/ts-san-app-parser'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe('TSSanAppParser', function () {
    const tsConfigFilePath = resolve(__dirname, '../../tsconfig.json')
    const project = new Project({ tsConfigFilePath, addFilesFromTsConfig: false })

    it('should add sanssrCid static property', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.projectFiles.size).toEqual(1)
        expect(sanApp.entrySourceFile.getFullText()).toContain('static sanssrCid')
    })

    it('should eval component classes', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.getEntryComponentClass()).toHaveProperty('sanssrCid', 0)
    })

    it('should skip non-component class', function () {
        const parser = new TSSanAppParser(project)
        const filepath = resolve(__dirname, '../../stub/b.comp.ts')
        const sanApp = parser.parseSanApp(filepath)
        const file = sanApp.projectFiles.get(filepath)
        expect(file.getClass('B').getStaticPropertyOrThrow('sanssrCid').getText()).toEqual('static sanssrCid: number = 0;')
        expect(file.getClass('C').getStaticProperty('sanssrCid')).toBeUndefined()
    })
})
