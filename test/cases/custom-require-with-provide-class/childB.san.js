const san = require('san')

const Child = san.defineComponent({
    id: 'default',
    initData () {
        return {
            text: 'bbb'
        }
    },
    template: '<div>{{ text }}</div>'
})

module.exports = Child
