
const san = require('san')

const Panel = san.defineComponent({
    template: '<div><slot/></div>'
})

const Button = san.defineComponent({
    template: '<div><a><slot/></a></div>'
})

const Folder = san.defineComponent({
    template: '<div><h3 on-click="toggle"><slot name="title"/></h3><slot s-if="!hidden"/></div>',
    toggle: function () {
        const hidden = this.data.get('hidden')
        this.data.set('hidden', !hidden)
    }
})

const MyComponent = san.defineComponent({
    components: {
        'x-panel': Panel,
        'x-folder': Folder,
        'x-button': Button
    },

    template: '<div>' +
        '<x-folder hidden="{{folderHidden}}">' +
        '<b slot="title">{{title}}</b>' +
        '<x-panel><u>{{name}}</u><x-button>{{closeText}}</x-button></x-panel>' +
        '</x-folder>' +
        '</div>'
})

exports = module.exports = MyComponent
