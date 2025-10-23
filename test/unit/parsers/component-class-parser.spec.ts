import { ComponentClassParser } from '../../../src/parsers/component-class-parser'
import { defineComponent, defineTemplateComponent } from 'san'

describe('ComponentClassParser', () => {
    it('should parse one single component', () => {
        const foo = defineComponent({ template: 'FOO' })
        const { componentInfos } = new ComponentClassParser(foo, '').parse()
        expect(componentInfos).toHaveLength(1)
        expect(componentInfos[0]).toHaveProperty('componentType', 'normal')
        expect(componentInfos[0].proto).toHaveProperty('template', 'FOO')
    })
    it('should parse recursively', () => {
        const foo = defineComponent({ template: 'FOO', id: 'foo' })
        const bar = defineComponent({ template: 'BAR', components: { foo } })
        const coo = defineComponent({ template: 'COO', components: { foo, bar } })
        const { componentInfos } = new ComponentClassParser(coo, '').parse()
        expect(componentInfos).toHaveLength(3)
        expect(componentInfos[0]).toHaveProperty('componentType', 'normal')
        expect(componentInfos.map(x => x.proto.template)).toEqual(['COO', 'BAR', 'FOO'])
        expect(componentInfos.find(item => item.id === 'foo')).toBeTruthy()
    })
    it('should parse defineTemplateComponent', () => {
        const foo = defineTemplateComponent({ template: '<div></div>' })
        const { componentInfos } = new ComponentClassParser(foo as san.DefinedComponentClass<{}>, '').parse()
        expect(componentInfos).toHaveLength(1)
        expect(componentInfos[0]).toHaveProperty('componentType', 'template')
    })
})
