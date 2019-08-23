const san = require('san')

const Label = san.defineComponent({
    template: '<u><slot/></u>'
})

const Panel = san.defineComponent({
    template: '<a><slot/></a>'
})

const LoadingLabel = san.defineComponent({
    template: '<b><slot/></b>'
})

let loadSuccess
const MyComponent = san.defineComponent({
    components: {
        'x-panel': Panel,
        'x-label': san.createComponentLoader({
            load: function () {
                return {
                    then: function (success) {
                        loadSuccess = success
                    }
                }
            },
            placeholder: LoadingLabel
        })
    },

    template: '<div><x-panel><x-label>Hello {{text}}</x-label></x-panel></div>',

    attached: function () {
        this.nextTick(function () {
            loadSuccess(Label)
        })
    }
})

exports = module.exports = MyComponent
