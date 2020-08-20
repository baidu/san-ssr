// complex structure in textnode
const san = require('san')

const MyComponent = san.defineComponent({
    template: '<div><img src="{{schema|raw}}" src2="{{schema}}"/></div>',
    initData: function() {
        return {
            "schema": '{#baiduboxapp://utils?action=getPrefetchRes&params={"keys":["firstImage"]}#}'
        }
    }
})

exports = module.exports = MyComponent
