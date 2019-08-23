// complex structure in textnode
const san = require('san')

const MyComponent = san.defineComponent({
    template: '<a><span>aaa</span>hello {{name|raw}}!<b>bbb</b></a>'
})

exports = module.exports = MyComponent
