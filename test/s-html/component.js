// bool attr
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<div>' +
        '<b s-html="html">asdfsa<u>dfa</u>sdfsa</b>' +
        '</div>'
})

exports = module.exports = MyComponent
