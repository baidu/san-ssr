const san = require('san')
const MyComponent = san.defineComponent({
    template: '<a><b s-if="nullValue === null">b</b></a>'
})

exports = module.exports = MyComponent
