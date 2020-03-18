import { SanSourceFile } from '../../../src/models/san-source-file'
import { Project } from 'ts-morph'

describe('models/san-sourcefile', () => {
    describe('.getClassDeclarations()', () => {
        it('should return all class declarations', () => {
            const proj = new Project()
            const file = SanSourceFile.createFromTSSourceFile(proj.createSourceFile('/foo.ts', 'class Foo{}\nclass Bar{}'))
            const decls = file.getClassDeclarations()
            expect(decls).toHaveLength(2)
            expect(decls[0].getName()).toEqual('Foo')
            expect(decls[1].getName()).toEqual('Bar')
        })
    })
})
