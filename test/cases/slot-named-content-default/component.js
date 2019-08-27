// default and named slot, content by default
const san = require('san')
const Tab = san.defineComponent({
    template: '<div>' +
        '<div class="head"><slot name="title"><h3 title="{{title}}">{{title}}</h3></slot></div>' +
        '<div><slot><p title="{{text}}">{{text}}</p></slot></div>' +
        '</div>',

    initData: function () {
        return {
            title: '5',
            text: 'five'
        }
    }
})

const MyComponent = san.defineComponent({
    components: {
        'ui-tab': Tab
    },

    template: '<div><ui-tab title="{{tTitle}}" text="{{tText}}">' +
        '</ui-tab></div>'
})

exports = module.exports = MyComponent
