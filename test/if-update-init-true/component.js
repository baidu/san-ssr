// update if, init with true
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<u>' +
        '<span san-if="cond" title="{{name}}">{{name}}</span>' +
        '</u>'
})

exports = module.exports = MyComponent
