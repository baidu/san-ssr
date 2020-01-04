const { Component } = require('san')

class MyComponent extends Component {
    initData () {
        return {
            formLen: 3
        }
    }
}

MyComponent.computed = {
    forms () {
        const cates = this.data.get('cates')
        const formLen = this.data.get('formLen')

        const result = {}
        let start = 1

        if (!cates) return result

        for (let i = 0; i < cates.length; i++) {
            result[cates[i]] = []
            for (let j = 0; j < formLen; j++) {
                result[cates[i]].push(start++)
            }
        }

        return result
    }
}

MyComponent.template = '<form>' +
  '<fieldset s-for="cate in cates">' +
    '<label s-for="item in forms[cate]">{{item}}</label>' +
  '</fieldset>' +
'</form>'

module.exports = exports = MyComponent
