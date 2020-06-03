const san = require('san')
const Child = san.defineComponent({
    template: '<b style="width: 1rem">{{text}}</b>'
})

const MyComponent = san.defineComponent({
    template: '<div><x-child style="{{style}}" s-ref="child"/></div>',
    components: {
        'x-child': Child
    }
})

exports = module.exports = MyComponent
