import { getSourceFileTypeOrThrow } from '../../../src/models/source-file-type'

describe('models/source-file-type', () => {
    describe('.getSourceFileTypeOrThrow()', () => {
        it('should return .js for /foo/bar.js', () => {
            const sourceFileType = getSourceFileTypeOrThrow('/foo/bar.js')
            expect(sourceFileType).toEqual('.js')
        })
        it('should return throw for /foo/bar.ps', () => {
            expect(() => getSourceFileTypeOrThrow('/foo/bar.ps')).toThrow(/not supported/)
        })
    })
})
