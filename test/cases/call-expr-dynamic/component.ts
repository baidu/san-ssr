import { Component } from 'san'

export default class MyComponent extends Component {
    static template = '<u>result {{op[isUp ? "plus" : "minus"](num1, num2)}}</u>'

    op = {
        plus (a: number, b: number) {
            return a + b
        },

        minus (a: number, b: number) {
            return a - b
        }
    }
}
