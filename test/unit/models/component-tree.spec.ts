import { ComponentTree } from '../../../src/models/component-tree'
import { defineComponent } from 'san'

describe('models/ComponentTree', () => {
    describe('.preOrder()', () => {
        it('should visit each component once', () => {
            const foo = defineComponent({ template: 'FOO' })
            const bar = defineComponent({ template: 'BAR', components: { foo } })
            const coo = defineComponent({ template: 'BAR', components: { foo, bar } })
            const tree = new ComponentTree(coo)
            expect([...tree.preOrder()]).toHaveLength(3)
        })
    })
})
