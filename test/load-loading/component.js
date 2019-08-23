const san = require('san')

const Label = san.defineComponent({
    template: '<u>{{text}}</u>'
})

const LoadingLabel = san.defineComponent({
    template: '<b>{{text}}</b>'
})

let loadSuccess
const MyComponent = san.defineComponent({
    components: {
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

    template: '<div><x-label text="{{text}}"/></div>',

    attached: function () {
        this.nextTick(function () {
            loadSuccess(Label)
        })
    }
})

exports = module.exports = MyComponent
