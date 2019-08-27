// bool attr
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<div>' +
        '<button disabled>button</button>' +
        '</div>'
})

exports = module.exports = MyComponent
