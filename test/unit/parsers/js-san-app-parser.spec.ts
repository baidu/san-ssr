import { JSSanAppParser } from '../../../src/parsers/js-san-app-parser'
import { resolve } from 'path'

describe('JSSanAppParser', function () {
    it('should eval component class', function () {
        const parser = new JSSanAppParser()
        const filepath = resolve(__dirname, '../../stub/a.comp.js')
        const sanApp = parser.parseSanApp(filepath)

        expect(sanApp.getEntryComponentClass()).toHaveProperty('name', 'ComponentClass')
    })

    it('should throw for invalid component', function () {
        const parser = new JSSanAppParser()
        const filepath = resolve(__dirname, '../../stub/foo.js')

        expect(() => parser.parseSanApp(filepath))
            .toThrow(/not likely a San Component/)
    })
})
