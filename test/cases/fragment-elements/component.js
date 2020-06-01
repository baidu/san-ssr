const san = require('san')
const MyComponent = san.defineComponent({
    template: '<div>' +
        '<fragment><b>Hello</b></fragment><fragment><span>Hello</span><b>{{name}}</b></fragment>' +
        '</div>'
})

exports = module.exports = MyComponent
