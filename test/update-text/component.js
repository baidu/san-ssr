// update text
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<a><span title="{{email}}">{{name}}</span></a>'
})

exports = module.exports = MyComponent
