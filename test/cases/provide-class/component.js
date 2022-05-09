const san = require('san')
const List = san.defineComponent({
    initData () {
        return {
            text: 'child'
        }
    },
    template: '<div>{{ text }}</div>'
})

const CompB = san.defineComponent({
    initData () {
        return {
            text: 'comp b'
        }
    },
    template: '<div>{{ text }}</div>'
})
const CompA = san.defineComponent({
    components: {
        'x-l': CompB
    },
    initData () {
        return {
            text: 'component a'
        }
    },
    template: '<div><div>{{ text }}</div><x-l/></div>'
})

const MyComponent = san.defineComponent({
    components: {
        'x-l': List,
        'x-g': san.createComponentLoader({
            load: () => {
                return List
            },
            placeholder: CompA
        })
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
        <x-g/>
    </div>`
})

exports = module.exports = MyComponent
