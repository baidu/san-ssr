import { ComponentParser } from '../../../src/parsers/component-parser'
import { defineComponent } from 'san'

describe('parsers/component-parser', () => {
    describe('ComponentParser', () => {
        it('should ignore undefined filters', () => {
            const parser = new ComponentParser()
            const identity = x => x
            const notdefined = undefined
            const info = parser.parseComponent(defineComponent({
                template: '',
                filters: { identity, notdefined }
            }))
            expect(Object.keys(info.filters)).toHaveLength(1)
            expect(info.filters).toHaveProperty('identity', identity)
        })

        it('should ignore non-function computed', () => {
            const parser = new ComponentParser()
            const identity = x => x
            const notdefined = undefined
            const info = parser.parseComponent(defineComponent({
                template: '',
                computed: { identity, notdefined } as any
            }))
            expect(Object.keys(info.computed)).toHaveLength(1)
            expect(info.computed).toHaveProperty('identity', identity)
        })
    })
})
