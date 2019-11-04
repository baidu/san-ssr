import { Component } from 'san'
import { sum } from '../../stub/sum'

export default class MyComponent extends Component {
    static template = '<u>result {{ sum(a, b) }}</u>'

    sum (a, b) {
        return sum(a, b)
    }
}
