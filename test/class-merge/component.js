const san = require('san')
const Child = san.defineComponent({
    template: '<b class="{{clazz}}">{{text}}</b>'
})

const MyComponent = san.defineComponent({
    template: '<div><x-child class="{{clazz}}" s-ref="child" /></div>',
    components: {
        'x-child': Child
    }
})

exports = module.exports = MyComponent
