// update if, init with false
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<u>' +
        '<a>nimei</a>' +
        '<span san-if="cond" title="{{name}}">{{name}}</span>' +
        '<span san-else title="{{name2}}">{{name2}}</span>' +
        '</u>'
})

exports = module.exports = MyComponent
