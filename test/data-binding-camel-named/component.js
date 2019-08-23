// data binding name auto camel case
const san = require('san')
const Label = san.defineComponent({
    template: '<a><span title="{{dataTitle}}">{{dataText}}</span></a>'
})

const MyComponent = san.defineComponent({
    components: {
        'ui-label': Label
    },

    template: '<div><ui-label data-title="{{title}}" data-text="{{text}}"></ui-label></div>'
})

exports = module.exports = MyComponent
