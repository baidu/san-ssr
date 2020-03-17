import { getDefaultTSConfigPath } from '../../../src/parsers/tsconfig'
import { resolve } from 'path'

describe('parsers/tsconfig', () => {
    describe('#getDefaultTSConfigPath()', () => {
        it('should resolve existing tsconfig in parent directory', () => {
            expect(getDefaultTSConfigPath()).toEqual(resolve(__dirname, '../../../tsconfig.json'))
        })
        it('should return undefined if no tsconfig exists', () => {
            expect(getDefaultTSConfigPath('/tmp')).toBeUndefined()
        })
    })
})
