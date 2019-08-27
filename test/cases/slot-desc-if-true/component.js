
const san = require('san')

const Folder = san.defineComponent({
    template: '<div><h3 on-click="toggle"><slot name="title"/></h3><slot s-if="!hidden"/></div>',
    toggle: function () {
        const hidden = this.data.get('hidden')
        this.data.set('hidden', !hidden)
    }
})

const MyComponent = san.defineComponent({
    components: {
        'x-folder': Folder
    },

    template: '' +
        '<div>' +
          '<x-folder hidden="{{folderHidden}}" s-ref="folder"><b slot="title">{{name}}</b><p>{{desc}}</p></x-folder>' +
        '</div>'
})

exports = module.exports = MyComponent
