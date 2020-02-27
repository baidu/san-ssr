const san = require('san')

const List = san.defineComponent({
    template: '<template><li s-for="item in list">{{item}}</li></template>'
})

exports = module.exports = san.defineComponent({
    components: {
        'x-l': List
    },
    template: '<ul><x-l list="{{[1, true, ...ext, \'erik\', ...ext2]}}"/></ul>'
})
