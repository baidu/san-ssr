import { functionString } from '../../../src/utils/lang'

describe('utils/lang', () => {
    describe('.functionString()', () => {
        it('should add function keyword for method shortcut', () => {
            const obj = { foo () {} }
            expect(functionString(obj.foo)).toMatch(/^function foo?\(\) ?{}$/)
        })

        it('should re-indent for indented function', () => {
            const obj = {
                foo () {
                    return 1
                }
            }
            expect(functionString(obj.foo)).toMatch(/function foo ?\(\)\s*{\n\s*return 1;\n}$/)
        })
    })
})
