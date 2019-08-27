// component root with if
const san = require('san')
const Child = san.defineComponent({
    template: '<b s-if="person">{{person.name}}</b>'
})

const MyComponent = san.defineComponent({
    template: '<div><x-child person="{{p}}"/></div>',
    components: {
        'x-child': Child
    }
})

exports = module.exports = MyComponent
