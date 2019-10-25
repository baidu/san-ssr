import { Component } from 'san'

export default class MyComponent extends Component {
    static computed = {
        realTitle: function () {
            return 'real' + this.data.get('title')
        }
    }

    static template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'
}
