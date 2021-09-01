const san = require('san')
const List = san.defineComponent({
    template: '<div>child</div>'
})

const MyComponent = san.defineComponent({
    components: {
        'x-l': List
    },
    template: '<div><x-l/></div>'
})

exports = module.exports = MyComponent
