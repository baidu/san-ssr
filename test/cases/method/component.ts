import { Component } from 'san'

export default class MyComponent extends Component {
    realTitle () {
        const foo = {
            prefix: 'real',
            getPrefix: () => foo.prefix
        }
        return foo.getPrefix() + this.data.get('title')
    }

    static template = '<div><b title="{{realTitle()}}">{{realTitle()}}</b></div>'
}
