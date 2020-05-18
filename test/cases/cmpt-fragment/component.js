// component with fragment root el
const san = require('san')

const Child = san.defineComponent({
    template: '<fragment>see <a href="{{link}}">{{linkText || name}}</a> to start <b>{{name}}</b> framework</fragment>'
})

const MyComponent = san.defineComponent({
    template: '<div><x-child link="{{link}}" name="{{name}}" link-text="{{linkText}}"/></div>',
    components: {
        'x-child': Child
    }
})

exports = module.exports = MyComponent
