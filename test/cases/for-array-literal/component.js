// push update for, init with many data
const san = require('san')
const MyComponent = san.defineComponent({
    template: '<ul><li s-for="item in [1, 2, three, ...other]">{{item}}</li></ul>'
})

exports = module.exports = MyComponent
