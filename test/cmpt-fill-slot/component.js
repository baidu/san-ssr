// update elif init with all true
const san = require('san')

const Panel = san.defineComponent({
    template: '<a><slot></slot></a>'
})

const SearchBox = san.defineComponent({
    template: '<div><input type="text" value="{=value=}"><button>search</button></div>'
})

const MyComponent = san.defineComponent({
    components: {
        'x-panel': Panel,
        'x-search': SearchBox
    },

    template: '<div><b title="{{searchValue}}">{{searchValue}}</b>' +
        '<x-panel><x-search value="{=searchValue=}"></x-search></x-panel></div>'
})

exports = module.exports = MyComponent
