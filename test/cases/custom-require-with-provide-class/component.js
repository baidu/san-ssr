const san = require('san')
const ChildA = require('./childA.san')

const MyComponent = san.defineComponent({
    components: {
        'x-a': ChildA,
        'x-b': ChildA
    },
    template: '<div><x-a/><x-b/></div>'
})

exports = module.exports = MyComponent
