const san = require('san')
const Panel = san.defineComponent({
    template: '<template><slot/></template>'
})

const MyComponent = san.defineComponent({
    components: {
        'x-p': Panel
    },
    template: '<div><x-p>{{text}}</x-p></div>'
})

exports = module.exports = MyComponent
