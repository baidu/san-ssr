import { createResolver } from '../../../src/runtime/resolver'
import { join } from 'path'

describe('runtime/resolver', () => {
    const resolver = createResolver({}, require)

    it('should resolve render from external module', () => {
        const render = resolver.getRenderer({ id: '0', specifier: join(__dirname, '../../stub/ssr.js') })
        expect(render()).toEqual('hello')
    })

    it('should change by custom require path', () => {
        const render = resolver.getRenderer(
            { id: '0', specifier: 'aaa' },
            { customSSRFilePath: () => join(__dirname, '../../stub/ssr.js') }
        )
        expect(render()).toEqual('hello')
    })
})
