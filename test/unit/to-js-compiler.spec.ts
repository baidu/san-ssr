import { ToJSCompiler } from '../../src/target-js'
import { SanAppParser } from '../../src/parsers/san-app-parser'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe.only('ToJSCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const project = new Project({ tsConfigFilePath })
    const parser = new SanAppParser(project)
    const cc = new ToJSCompiler({ project, tsConfigFilePath })

    it('should compile a single component', function () {
        const filepath = resolve(__dirname, '../stub/foo.ts')

        expect(() => parser.parseSanApp(filepath))
            .toThrow(/not likely a San Component/)
    })
})
