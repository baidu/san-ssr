
const san = require('san')

const MyComponent = san.defineComponent({
    template: '<form>' +
      '<fieldset s-for="cate in cates">' +
        '<label s-for="item in forms[cate]">{{item}}</label>' +
      '</fieldset>' +
    '</form>',

    initData: function () {
        return {
            formLen: 3
        }
    },

    computed: {
        forms: function () {
            const cates = this.data.get('cates')
            const formLen = this.data.get('formLen')

            const result = {}
            if (cates instanceof Array) {
                let start = 1
                for (let i = 0; i < cates.length; i++) {
                    result[cates[i]] = []
                    for (let j = 0; j < formLen; j++) {
                        result[cates[i]].push(start++)
                    }
                }
            }

            return result
        }
    }
})

exports = module.exports = MyComponent
