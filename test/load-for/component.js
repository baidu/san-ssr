const san = require('san')

const LI = san.defineComponent({
    template: '<li><b><slot/></b></li>'
})

const LoadingLabel = san.defineComponent({
    template: '<li><slot/></li>'
})

let loadInvokeCount = 0
let loadSuccess
const MyComponent = san.defineComponent({
    components: {
        'x-li': san.createComponentLoader({
            load: function () {
                loadInvokeCount++
                return {
                    then: function (success) {
                        loadSuccess = success
                    }
                }
            },
            placeholder: LoadingLabel
        })
    },

    template: '<ul><x-li s-for="item in list">Hello {{item}}</x-li></ul>'
})

exports = module.exports = MyComponent
