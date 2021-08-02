const san = require('san')
const Child = require('./childA.san')

const MyComponent = san.defineComponent({
    components: {
        'x-l': Child
    },
    template: '<div><x-l/></div>'
})

module.exports = MyComponent
