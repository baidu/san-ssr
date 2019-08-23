// two way binding text value
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<div><span title="{{name}}">{{name}}</span> <input value="{=name=}"/></div>'
})

exports = module.exports = MyComponent
