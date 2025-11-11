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

module.exports = san.defineComponent({
    components: {
        MyComponent,
        MyComponent2
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
