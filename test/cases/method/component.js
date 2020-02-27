const san = require('san')

const MyComponent = san.defineComponent({
    realTitle () {
        const foo = {
            prefix: 'real',
            getPrefix: () => foo.prefix
        }
        return foo.getPrefix() + this.data.get('title')
    },
    template: '<div><b title="{{realTitle()}}">{{realTitle()}}</b></div>'
})

exports = module.exports = MyComponent
