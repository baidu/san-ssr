// class and style auto expand
const san = require('san')

const Label = san.defineComponent({
    template: '<a><u s-if="hasu"></u></a>'
})

const MyComponent = san.defineComponent({
    components: {
        'ui-label': Label
    },

    template: '<div><ui-label s-ref="l" hasu></ui-label></div>'
})

exports = module.exports = MyComponent
