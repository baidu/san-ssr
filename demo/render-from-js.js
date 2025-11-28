const san = require('san')
class MyComponent extends san.Component {
    static template = '<h3>{{myName}}</h3>'

    inited () {
        this.d.title = 'MyComponent-Inited'
    }

    initData () {
        return {
            title: 'MyComponent'
        }
    }

    static computed = {
        myName () {
            const name = this.d.name
            return `${name} - ${this.d.title}`
        }
    }
}

const MyComponent2 = san.defineComponent({
    template: '<h4>{{name}}</h4>',
    inited () {
        this.d.name = 'MyComponent2'
    }
})

const SubChild = san.defineComponent({
    template: '<i>{{text}}</i>',
    ssr: 'render-hydrate'
});

const Child = san.defineComponent({
    components: {
        'ui-sub': SubChild
    },
    template: '<p><ui-sub text="{{dt}}"/></p>'
});

const ULabel = san.defineComponent({
    template: '<u>{{text}}</u>',
    ssr: 'render-hydrate'
});

const MyComponent3 = san.defineComponent({
    components: {
        'ui-u': ULabel,
        'ui-c': Child
    },
    ssr: 'render-only',
    template: '<div><ui-c dt="{{name}}"/><a><ui-u text="{{email}}"/></a></div>'
});

module.exports = san.defineComponent({
    components: {
        MyComponent,
        MyComponent2,
        MyComponent3
    },
    computed: {
        name: function () {
            const f = this.d.firstName
            const l = this.data.get('lastName')
            return `${f} ${l}`
        }
    },
    template: '<div><h1>{{name}}</h1><MyComponent name="{{name}}"/><MyComponent2/></div>'
})
