const san = require('san')
const TTIComponent = san.defineComponent({
    template: '<div id="app"><ul><li san-for="item, index in items">{{item}}<button on-click="rm(index)">delete</button></li></ul></div>',
    rm: function (index) {
        this.data.removeAt('items', index)
    }
})
exports = module.exports = TTIComponent
