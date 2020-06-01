const san = require('san')

const Child = san.defineComponent({
    template: '<h3>see <a href="{{link}}">{{linkText || name}}</a> to start <b>{{name}}</b> framework</h3>'
})

const Wrap = san.defineComponent({
    template: '<x-child link="{{link}}" name="{{framework}}" link-text="{{linkText}}" />',
    components: {
        'x-child': Child
    }
})

const MyComponent = san.defineComponent({
    template: '<x-wrap link="{{link}}" framework="{{framework}}" link-text="{{linkText}}" />',
    components: {
        'x-wrap': Wrap
    }
})

exports = module.exports = MyComponent