import { normalizeComponentClass } from '../../../src/parsers/normalize-component'
import { Project } from 'ts-morph'

describe('parsers/normalize-component', () => {
    describe('.normalizeComponentClass()', () => {
        it('should throw for anonymous class', () => {
            const project = new Project({ addFilesFromTsConfig: false })
            const sourceFile = project.createSourceFile('/foo.ts', `export default class {}`)
            const clazz = sourceFile.getClasses()[0]
            expect(() => normalizeComponentClass(clazz)).toThrow(/anonymous component class is not supported/)
        })
    })
})
