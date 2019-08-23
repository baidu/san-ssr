const san = require('san')

const Label = san.defineComponent({
    template: '<u>{{text}}</u>'
})

const LoadingLabel = san.defineComponent({
    template: '<b>{{text}}</b>'
})

const FallbackLabel = san.defineComponent({
    template: '<input value="{{text}}"/>'
})

let loadFail
let loadSuccess
const MyComponent = san.defineComponent({
    components: {
        'x-label': san.createComponentLoader({
            load: function () {
                return {
                    then: function (success, fail) {
                        loadSuccess = success
                        loadFail = fail
                    }
                }
            },
            placeholder: LoadingLabel,
            fallback: FallbackLabel
        })
    },

    template: '<div><x-label text="{{text}}"/></div>',

    attached: function () {
        this.nextTick(function () {
            loadFail()
        })
    }
})

exports = module.exports = MyComponent
