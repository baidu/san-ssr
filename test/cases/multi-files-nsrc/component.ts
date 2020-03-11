import { Component } from 'san'
import { abs } from './abs'
import { enhance } from './enhance'

export default class MyComponent extends Component {
    static template = '<u>result {{10 + (base !== 0 ? enhance(num, abs(base)) : enhance(num, 1))}}</u>'

    enhance (num, times) {
        return enhance(num, times)
    }

    abs (num) {
        return abs(num)
    }
}
