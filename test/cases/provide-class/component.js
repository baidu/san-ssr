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
    initData () {
        return {
            c: 'x-l'
        }
    },
    trimWhitespace: 'all',
    template: `<div>
        <div s-is="c"></div>
        <x-l/>
    </div>`
})

exports = module.exports = MyComponent
