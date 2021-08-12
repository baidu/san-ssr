import { handleError } from '../../../src/runtime/handle-error'
import { SanComponent } from 'san'

describe('runtime/resolver', () => {
    it('should call parent error', () => {
        const spy = jest.fn()
        const instance = {
            parentComponent: {
                error: spy
            } as unknown as SanComponent<{}>
        } as SanComponent<{}>

        handleError(new Error('error'), instance, 'test')

        expect(spy).toHaveBeenCalled()
        const args = spy.mock.calls[0]
        expect(args[2]).toBe('test')
        expect(args[0] instanceof Error).toBe(true)
        expect(args[0].message).toBe('error')
    })
    it('should not call parent error', () => {
        const spy = jest.fn()
        const spy2 = jest.fn()
        const instance = {
            parentComponent: {
                error: spy2
            } as unknown as SanComponent<{}>,
            error: spy
        } as unknown as SanComponent<{}>

        handleError(new Error('error'), instance, 'test')

        expect(spy).toHaveBeenCalled()
        expect(spy2).toHaveBeenCalledTimes(0)
        const args = spy.mock.calls[0]
        expect(args[2]).toBe('test')
        expect(args[0] instanceof Error).toBe(true)
        expect(args[0].message).toBe('error')
    })
    it('should throw error', () => {
        const spy = jest.fn()
        const instance = {
            parentComponent: {
            } as SanComponent<{}>
        } as SanComponent<{}>

        try {
            handleError(new Error('error'), instance, 'test')
        } catch (e) {
            spy(e)
        }

        expect(spy).toHaveBeenCalled()
        const args = spy.mock.calls[0]
        expect(args[0] instanceof Error).toBe(true)
        expect(args[0].message).toBe('error')
    })
})
