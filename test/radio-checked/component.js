// checkbox checked
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<div>' +
        '<input san-for="item in list" type="radio" value="{{item}}" checked="{=cValue=}">' +
        '</div>'
})

exports = module.exports = MyComponent
