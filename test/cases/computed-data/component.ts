import { Component } from 'san'
import { ComputedDeclarations } from '../../..'

export default class MyComponent extends Component {
    static computed: ComputedDeclarations = {
        realTitle: function () {
            return 'real' + this.data.get('title')
        }
    }

    static template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'
}
