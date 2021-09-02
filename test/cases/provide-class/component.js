const san = require('san')
const List = san.defineComponent({
    initData () {
        return {
            text: 'child'
        }
    },
    template: '<div>{{ text }}</div>'
})

const MyComponent = san.defineComponent({
    components: {
        'x-l': List
    },
    template: '<div><x-l/></div>'
})

exports = module.exports = MyComponent
