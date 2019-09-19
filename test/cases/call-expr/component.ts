import { Component } from 'san'

export default class MyComponent extends Component {
    static template = '<u>result {{10 + (base !== 0 ? enhance(num, abs(base)) : enhance(num, 1))}}</u>'

    enhance (num, times) {
        return num * this.square(times)
    }

    square (num) {
        return num * num
    }

    abs (num) {
        if (num < 0) {
            return -num
        }

        return num
    }
}
