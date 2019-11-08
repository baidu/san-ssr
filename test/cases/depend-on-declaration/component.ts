import { Component } from 'san'
import { htmlspecialchars } from './php'

export default class MyComponent extends Component {
    expr () {
        return htmlspecialchars('a < b')
    }

    static template = '<div><b s-html="{{expr()}}"></b></div>'
}
