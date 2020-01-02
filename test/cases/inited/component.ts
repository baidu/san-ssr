import { Component } from 'san'

export default class MyComponent extends Component {
    initData () {
        return {
            t: 'title'
        }
    }
    inited () {
        const data = this.data
        const realTitle = 'real' + data.get('title')
        data.set('_realTitle', realTitle)
    }
    static computed = {
        realTitle: function () {
            return this.data.get('_realTitle')
        }
    }

    static template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'
}
