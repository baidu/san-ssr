const san = require('san')

const Label = san.defineComponent({
    template: '<b>{{text}}</b>'
})

let loadSuccess
const MyComponent = san.defineComponent({
    template: '<div><span>not label</span><x-label text="{{text}}"/></div>',

    getComponentType: (aNode) => aNode.tagName === 'x-label' ? Label : undefined,

    attached: function () {
        this.nextTick(function () {
            loadSuccess(Label)
        })
    }
})

exports = module.exports = MyComponent
