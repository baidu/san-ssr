const san = require('san')

const Child = san.defineComponent({
    id: 'default',
    initData () {
        return {
            text: 'aaa'
        }
    },
    template: '<div>{{ text }}</div>'
})

module.exports = Child
