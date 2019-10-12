import { Component } from 'san'

export default class A extends Component {
    public static template = 'empty'
    public static filters = {
        'add': (x, y) => x + y
    }
}
