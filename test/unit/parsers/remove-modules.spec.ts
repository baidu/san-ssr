import { removeModules } from '../../../src/parsers/remove-modules'
import { TypedSanSourceFile } from '../../../src/models/san-source-file'
import { SanProject } from '../../../src/models/san-project'
import { resolve } from 'path'

const testRoot = resolve(__dirname, '../../')
const stubRoot = resolve(testRoot, 'stub')

const mockDebug = jest.fn()
jest.mock('debug', () => () => (str: string) => mockDebug(str))

describe('removeModules', () => {
    it('should deal with TypedSanSourceFile only', () => {
        const proj = new SanProject()
        const sanSourceFile = proj.parseSanSourceFile(resolve(stubRoot, './a.comp.js'))
        removeModules(sanSourceFile, [])
        expect(mockDebug).toHaveBeenCalledWith('TypedSanSourceFile is required')
    })

    it('should remove modules', () => {
        const proj = new SanProject(resolve(testRoot, '../tsconfig.json'))
        const sanSourceFile = proj.parseSanSourceFile(
            resolve(stubRoot, './remove-modules.comp.ts')
        ) as TypedSanSourceFile
        removeModules(sanSourceFile, [/^foo/])
        expect(sanSourceFile.tsSourceFile.getImportDeclaration('foo')).toBeUndefined()
    })
})
