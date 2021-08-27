import { cancelMarkExternalComponent, markExternalComponent } from '../../../src'
import { COMPONENT_REFERENCE } from '../../../src/helpers/markExternalComponent'
import bar from '../../stub/bar'

describe('markExternalComponent', () => {
    it('should hook require and cancel', () => {
        const originRequire = require('module').prototype.require
        markExternalComponent({
            isExternalComponent () { return true }
        })
        expect(originRequire !== require('module').prototype.require).toBeTruthy()

        cancelMarkExternalComponent()
        expect(originRequire === require('module').prototype.require).toBeTruthy()
    })

    it('should return Proxy', () => {
        markExternalComponent({
            isExternalComponent (specifier) { return specifier === 'none-exist-module' }
        })

        const m = require('module').prototype.require('none-exist-module')
        const newBar = require('module').prototype.require.call(module, '../../stub/bar')

        expect(newBar.bar === bar.bar).toBeTruthy()

        expect(m[COMPONENT_REFERENCE].specifier).toBe('none-exist-module')
        expect(m[COMPONENT_REFERENCE].id).toBe('default')

        const randomStr = Math.random().toString(36).slice(2)
        expect(m[randomStr][COMPONENT_REFERENCE].specifier).toBe('none-exist-module')
        expect(m[randomStr][COMPONENT_REFERENCE].id).toBe(randomStr)
    })
})
