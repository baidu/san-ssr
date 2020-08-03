import { ComponentClassParser } from '../../../src/parsers/component-class-parser'
import { defineComponent } from 'san'

describe('ComponentClassParser', () => {
    it('should parse one single component', () => {
        const foo = defineComponent({ template: 'FOO' })
        const { componentInfos } = new ComponentClassParser(foo).parse()
        expect(componentInfos).toHaveLength(1)
        expect(componentInfos[0].proto).toHaveProperty('template', 'FOO')
    })
    it('should parse recursively', () => {
        const foo = defineComponent({ template: 'FOO' })
        const bar = defineComponent({ template: 'BAR', components: { foo } })
        const coo = defineComponent({ template: 'COO', components: { foo, bar } })
        const { componentInfos } = new ComponentClassParser(coo).parse()
        expect(componentInfos).toHaveLength(3)
        expect(componentInfos.map(x => x.proto.template)).toEqual(['COO', 'BAR', 'FOO'])
    })
})
