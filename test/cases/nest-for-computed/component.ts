import { Component } from 'san'

export default class MyComponent extends Component {
    public static template = '<form>' +
      '<fieldset s-for="cate in cates">' +
        '<label s-for="item in forms[cate]">{{item}}</label>' +
      '</fieldset>' +
    '</form>'

    initData () {
        return {
            formLen: 3
        }
    }

    static computed = {
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
}
