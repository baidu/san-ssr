const san = require('san')
const ChildA = require('./childA.san.js')

const MyComponent = san.defineComponent({
    components: {
        'x-g': san.createComponentLoader({
            load: () => {
                return ChildA
            },
            placeholder: ChildA
        })
    },
    trimWhitespace: 'all',
    template: `<div>
        <x-g/>
    </div>`
})

exports = module.exports = MyComponent
