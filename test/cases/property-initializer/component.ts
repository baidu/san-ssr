import { Component } from 'san'

const TEMPLATE = '<div><b title="{{title | real}}">{{title | real}}</b></div>'

export default class MyComponent extends Component {
    static template = TEMPLATE
    static filters = {
        real: function (x) {
            return 'real' + x
        }
    }
}
