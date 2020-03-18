import { ElementCompiler } from '../../../../src/target-js/compilers/element-compiler'
import { parseTemplate } from 'san'

describe('target-js/compilers/element-compiler', () => {
    it('should not contain inherited properties', () => {
        parseTemplate('<div></div>')
    })
})
