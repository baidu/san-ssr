import { createResolver } from '../../../src/runtime/resolver'
import { join } from 'path'

describe('runtime/resolver', () => {
    const resolver = createResolver({})

    it('should resolve render from external module', () => {
        const render = resolver.getRenderer('0', join(__dirname, '../../stub/ssr.js'))
        expect(render()).toEqual('hello')
    })
})
