import { SanProject } from '../../../src/models/san-project'

describe('SanProject', function () {
    it('should not throw if called with no options', function () {
        expect(() => new SanProject()).not.toThrow()
    })

    it('should not throw if tsConfigFilePath not found', function () {
        expect(() => new SanProject({
            tsConfigFilePath: null // simulate the case when no tsconfig found
        })).not.toThrow()
    })
})
